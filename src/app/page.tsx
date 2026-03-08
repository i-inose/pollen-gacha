"use client";

import { useState, useEffect, useCallback } from "react";
import { Character, PollenLevel } from "@/types";
import { shareToX, shareToFacebook } from "@/lib/share";
import {
  getNickname,
  setNickname as saveNickname,
  addGachaResult,
  incrementUserCount,
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
  const [regionName, setRegionName] = useState("東京都");
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentResult, setCurrentResult] = useState<Character | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const init = async () => {
      const saved = getNickname();
      if (saved) {
        setNickname(saved);
      }

      try {
        const pollenData = await fetchPollenData("tokyo");
        setPollenLevel(pollenData.level);
        setRegionName(pollenData.regionName || "東京都");
      } catch {
        const { calculatePollenLevel } = await import("@/data/pollen");
        setPollenLevel(calculatePollenLevel(new Date().getMonth() + 1));
      }

      try {
        const count = await fetchUserCount();
        setUserCount(count);
      } catch {
        // ignore
      }

      setIsLoaded(true);
    };
    init();
  }, []);

  const handleNicknameSubmit = async (name: string) => {
    saveNickname(name);
    setNickname(name);

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
    if (isAnimating || !nickname) return;
    setShowResult(false);

    try {
      const { character, pollenLevel: level } = await executeGacha(
        nickname,
        "tokyo"
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

    if (currentResult && nickname) {
      addGachaResult({
        character: currentResult,
        pollenLevel,
        timestamp: new Date().toISOString(),
        nickname,
        region: "tokyo",
      });
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

  const handleRetry = () => {
    setShowResult(false);
    setCurrentResult(null);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-yellow-50 to-orange-50">
        <div className="text-4xl animate-spin">🌸</div>
      </div>
    );
  }

  if (!nickname) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-yellow-50 to-orange-50 p-4">
        <NicknameForm onSubmit={handleNicknameSubmit} />
        <div className="mt-6">
          <UserCounter count={userCount} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-yellow-50 to-orange-50 p-4">
      {/* ヘッダー */}
      <header className="w-full max-w-md flex items-center justify-between py-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">🌸 花粉ガチャ</h1>
          <p className="text-xs text-gray-500">こんにちは、{nickname} さん</p>
        </div>
        <a
          href="/ranking"
          className="px-4 py-2 text-sm bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
        >
          🏆 ランキング
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
            onRetry={handleRetry}
          />
        ) : (
          <GachaButton
            onClick={handleGacha}
            disabled={isAnimating}
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
