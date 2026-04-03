"use client";

import { useEffect, useRef, useState } from "react";

type Stat = {
  label: string;
  value: number;
  suffix?: string;
};

const useCountUp = (target: number, active: boolean, duration = 1200) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;

    let frameId: number;
    let start: number | null = null;

    const step = (timestamp: number) => {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setValue(Math.floor(target * eased));

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      }
    };

    frameId = requestAnimationFrame(step);

    return () => cancelAnimationFrame(frameId);
  }, [target, active, duration]);

  return value;
};

export const StatsStrip = () => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const stats: Stat[] = [
    { label: "Active users", value: 1200, suffix: "+" },
    { label: "Successful campaigns", value: 850, suffix: "+" },
    { label: "Total donated (USD)", value: 2, suffix: "M+" },
    { label: "Countries & regions", value: 120, suffix: "+" },
  ];

  return (
    <section
      ref={ref}
      className={`bg-white transition-all duration-700 ease-out transform ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 text-center sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const count = useCountUp(stat.value, visible);
            return (
              <div key={stat.label} className="space-y-1">
                <p className="text-2xl sm:text-3xl font-semibold text-[#022C22]">
                  {count}
                  {stat.suffix}
                </p>
                <p className="text-xs sm:text-sm text-gray-500">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsStrip;
