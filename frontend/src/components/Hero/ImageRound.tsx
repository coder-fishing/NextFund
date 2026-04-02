'use client';

import Image from 'next/image';
import { useEffect, useState, useId } from 'react';

export const ImageRound = ({
  src,
  alt,
  title,
  percent = 100,
  positionX,
  positionY,
}: {
  src: string;
  alt: string;
  title: string;
  percent?: number;
  positionX: string;
  positionY: string;
}) => {
  const [progress, setProgress] = useState(0);
  const [mounted, setMounted] = useState(false);
  const gradientId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let start: number | null = null;
    const duration = 1000; // ms

    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const progressTime = timestamp - start;

      const percentProgress = Math.min(
        (progressTime / duration) * percent,
        percent
      );

      setProgress(percentProgress);

      if (percentProgress < percent) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [percent]);

  if (!mounted) return null;

  const size = 140;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const offset = circumference - (progress / 100) * circumference;

  return (
    <div
      className="absolute hidden md:inline-flex items-center justify-center hover:scale-110 transition-transform duration-200 cursor-pointer "
      style={{
        left: positionX,
        top: positionY,
        width: size,
        height: size,
      }}
    >
      {/* SVG */}
      <svg width={size} height={size} className="rotate-[-90deg]">
        <defs>
          <linearGradient
            id={gradientId}
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1="0"
            x2={size}
            y2="0"
          >
            <stop offset="0%" stopColor="#A9F56B" />
            <stop offset="100%" stopColor="#4B9E44" />
          </linearGradient>
        </defs>

        {/* Background */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={stroke}
          fill="transparent"
        />

        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={stroke}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 0.1s linear',
          }}
        />
      </svg>

      {/* Avatar */}
      <div className="absolute inset-0 m-auto w-[120px] h-[120px] rounded-full overflow-hidden border-4 border-white">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="15000px"
          className="object-cover"
          priority
        />
      </div>

      {/* Label */}
      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-800 shadow-md shadow-emerald-200 whitespace-nowrap">
        {title}
      </div>
    </div>
  );
};