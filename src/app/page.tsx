"use client";

import { useState, useEffect, useCallback } from "react";
import { Character, PollenLevel } from "@/types";
import { shareToX, shareToFacebook } from "@/lib/share";
import {
  getNickname,
  setNickname as saveNickname,
  getRegion,
  setRegion as saveRegion,
  addGachaResult,
  incrementUserCount,
  hasPlayedToday,
  markPlayedToday,
  getGachaHistory,
} from "@/lib/storage";
import {
  fetchPollenData,
  executeGacha,
  registerUser,
  fetchUserCount,
} from "@/lib/api";
import NicknameForm from "@/components/NicknameForm";
import PollenLevelDisplay from "@/components/PollenLevelDisplay";
import GachaButton from "@/components/GachaButton";
import GachaAnimation from "@/components/GachaAnimation";
import GachaResultCard from "@/components/GachaResultCard";
import UserCounter from "@/components/UserCounter";

export default function Home() {
  const [nickname, setNickname] = useState<string | null>(null);
  const [pollenLevel, setPollenLevel] = useState<PollenLevel>(1);
  const [region, setRegion] = useState("tokyo");
  const [regionName, setRegionName] = useState("東京都");
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentResult, setCurrentResult] = useState<Character | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [alreadyPlayed, setAlreadyPlayed] = useState(false);

  useEffect(() => {
    const init = async () => {
      const saved = getNickname();
      const savedRegion = getRegion() || "tokyo";
      if (saved) {
        setNickname(saved);
      }
      setRegion(savedRegion);

      try {
        const pollenData = await fetchPollenData(savedRegion);
        setPollenLevel(pollenData.level);
        setRegionName(pollenData.regionName || "東京都");
      } catch {
        const { calculatePollenLevelByRegion } = await import("@/data/pollen");
        const { getPrefectureName } = await import("@/data/prefectures");
        setPollenLevel(calculatePollenLevelByRegion(new Date().getMonth() + 1, savedRegion));
        setRegionName(getPrefectureName(savedRegion));
      }

      try {
        const count = await fetchUserCount();
        setUserCount(count);
      } catch {
        // ignore
      }

      // 今日すでにガチャを引いていたら結果を復元
      if (hasPlayedToday()) {
        setAlreadyPlayed(true);
        const history = getGachaHistory();
        const today = new Date().toISOString().split("T")[0];
        const todayResult = history.find((r) => r.timestamp.startsWith(today));
        if (todayResult) {
          setCurrentResult(todayResult.character);
          setShowResult(true);
        }
      }

      setIsLoaded(true);
    };
    init();
  }, []);

  const handleNicknameSubmit = async (name: string, selectedRegion: string) => {
    saveNickname(name);
    saveRegion(selectedRegion);
    setNickname(name);
    setRegion(selectedRegion);

    try {
      const pollenData = await fetchPollenData(selectedRegion);
      setPollenLevel(pollenData.level);
      setRegionName(pollenData.regionName);
    } catch {
      const { calculatePollenLevelByRegion } = await import("@/data/pollen");
      const { getPrefectureName } = await import("@/data/prefectures");
      setPollenLevel(calculatePollenLevelByRegion(new Date().getMonth() + 1, selectedRegion));
      setRegionName(getPrefectureName(selectedRegion));
    }

    try {
      await registerUser(name);
      const count = await fetchUserCount();
      setUserCount(count);
    } catch {
      const newCount = incrementUserCount();
      setUserCount(newCount);
    }
  };

  const handleGacha = async () => {
    if (isAnimating || !nickname || alreadyPlayed) return;
    setShowResult(false);

    try {
      const { character, pollenLevel: level } = await executeGacha(
        nickname,
        region
      );
      setPollenLevel(level);
      setCurrentResult(character);
      setIsAnimating(true);
    } catch (error) {
      console.error("Gacha error:", error);
      const { drawGacha } = await import("@/lib/gacha");
      const character = drawGacha(pollenLevel);
      setCurrentResult(character);
      setIsAnimating(true);
    }
  };

  const handleAnimationComplete = useCallback(() => {
    // アニメーション完了後にクリックで結果画面へ
  }, []);

  const handleCloseAnimation = () => {
    setIsAnimating(false);
    setShowResult(true);
    setAlreadyPlayed(true);

    if (currentResult && nickname) {
      addGachaResult({
        character: currentResult,
        pollenLevel,
        timestamp: new Date().toISOString(),
        nickname,
        region,
      });
      markPlayedToday();
    }
  };

  const handleShare = (platform: "x" | "facebook") => {
    if (!currentResult) return;
    if (platform === "x") {
      shareToX(currentResult, pollenLevel);
    } else {
      shareToFacebook(currentResult, pollenLevel);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-emerald-400/30 border-t-emerald-400 animate-spin" />
      </div>
    );
  }

  if (!nickname) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 relative z-10">
        <NicknameForm onSubmit={handleNicknameSubmit} />
        <div className="mt-6">
          <UserCounter count={userCount} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-4 relative z-10">
      {/* ヘッダー */}
      <header className="w-full max-w-md flex items-center justify-between py-4">
        <div>
          <h1 className="text-xl font-bold bg-linear-to-r from-emerald-300 to-amber-200 bg-clip-text text-transparent drop-shadow-lg tracking-wider">
            花粉ガチャ
          </h1>
          <p className="text-xs text-white/50">こんにちは、{nickname} さん</p>
        </div>
        <a
          href="/ranking"
          className="game-btn px-4 py-2 text-sm no-underline"
        >
          ランキング
        </a>
      </header>

      {/* 花粉レベル表示 */}
      <div className="mt-4 w-full flex justify-center">
        <PollenLevelDisplay level={pollenLevel} regionName={regionName} />
      </div>

      {/* ガチャボタン or 結果カード */}
      <div className="flex-1 flex items-center justify-center py-8">
        {showResult && currentResult ? (
          <GachaResultCard
            character={currentResult}
            pollenLevel={pollenLevel}
            onShare={handleShare}
          />
        ) : (
          <GachaButton
            onClick={handleGacha}
            disabled={isAnimating || alreadyPlayed}
            pollenLevel={pollenLevel}
          />
        )}
      </div>

      {/* 利用者数 */}
      <div className="pb-4">
        <UserCounter count={userCount} />
      </div>

      {/* ガチャアニメーション（オーバーレイ） */}
      {isAnimating && (
        <div onClick={handleCloseAnimation}>
          <GachaAnimation
            character={currentResult}
            isPlaying={isAnimating}
            onComplete={handleAnimationComplete}
          />
        </div>
      )}
    </div>
  );
}
