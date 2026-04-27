"use client";

import { useEffect, useRef, useState } from "react";
import { AppMockUp } from "./AppMockUp";
import { StepGuide } from "./StepGuide";
import { steps } from "@/const/step";

const StepSection: React.FC = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [autoEnabled, setAutoEnabled] = useState(true);
    const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        if (!autoEnabled) return; // sau khi user click thì không auto nữa

        const handleScroll = () => {
            const viewportCenter = window.innerHeight / 2;
            let closestIndex = 0;
            let closestDistance = Infinity;

            stepRefs.current.forEach((el, index) => {
                if (!el) return;
                const rect = el.getBoundingClientRect();
                const elementCenter = rect.top + rect.height / 2;
                const distance = Math.abs(elementCenter - viewportCenter);

                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestIndex = index;
                }
            });

            // chỉ đổi step khi phần tử gần nhất đủ gần tâm màn hình
            if (closestDistance < 200 && closestIndex !== activeIndex) {
                setActiveIndex(closestIndex);
            }
        };

        let ticking = false;
        const onScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        };

        // cập nhật 1 lần khi mount
        handleScroll();

        window.addEventListener("scroll", onScroll);
        return () => {
            window.removeEventListener("scroll", onScroll);
        };
    }, [activeIndex, autoEnabled]);

    return (
        <section className="bg-gray-50 py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <h2 className="max-w-2xl text-2xl font-bold text-gray-800 sm:text-3xl">
                    Fundraising on NextFund is easy, powerful, and trusted
                </h2>

                <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
                    <div>
                        <AppMockUp step={activeIndex + 1} />
                    </div>

                    <div className="space-y-8">
                        {steps.map((item, index) => (
                            <div
                                key={item.step}
                                ref={(el) => {
                                    stepRefs.current[index] = el;
                                }}
                            >
                                <StepGuide
                                    step={item.step}
                                    title={item.title}
                                    description={item.description}
                                    isActive={index === activeIndex}
                                    onClick={() => {
                                        setActiveIndex(index);
                                        setAutoEnabled(false);
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default StepSection;