type AppMockUpProps = {
    step: number;
};

const baseCard = (
    <div className="w-full max-w-xs rounded-3xl bg-white p-4 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
            <div className="h-2 w-12 rounded-full bg-gray-200" />
            <div className="h-2 w-8 rounded-full bg-gray-200" />
        </div>
    </div>
);

export const AppMockUp: React.FC<AppMockUpProps> = ({ step }) => {
    const renderContent = () => {
        if (step === 1) {
            return (
                <div className="w-full max-w-xs rounded-3xl bg-white p-4 shadow-lg">
                    <div className="mb-4 flex items-center justify-between">
                        <div className="h-2 w-12 rounded-full bg-gray-200" />
                        <div className="h-2 w-8 rounded-full bg-gray-200" />
                    </div>
                    <div className="mb-4 text-sm font-semibold text-gray-800">
                        Set your starting goal
                    </div>
                    <div className="mb-4 h-10 w-full rounded-xl bg-gray-100" />
                    <div className="mb-4 rounded-2xl bg-yellow-50 p-4 text-center text-sm text-gray-800">
                        Fundraisers like yours typically aim to raise
                        <br />
                        <span className="font-semibold">$2,000 or more</span>
                    </div>
                    <div className="mb-4 h-2 w-3/4 rounded-full bg-green-500" />
                    <div className="h-2 w-3/4 rounded-full bg-gray-100" />
                </div>
            );
        }

        if (step === 2) {
            // UI: chia sẻ qua mạng xã hội
            return (
                <div className="w-full max-w-xs rounded-3xl bg-white p-4 shadow-lg">
                    <div className="mb-4 flex items-center justify-between">
                        <div className="h-2 w-24 rounded-full bg-gray-200" />
                        <div className="h-2 w-10 rounded-full bg-gray-200" />
                    </div>

                    <div className="mb-3 h-9 w-full rounded-xl bg-gray-100" />

                    <div className="mb-4 flex items-center justify-between text-xs font-medium text-gray-500">
                        <span>Share fundraiser</span>
                        <span className="h-4 w-12 rounded-full bg-gray-100" />
                    </div>

                    <div className="mb-4 flex items-center justify-between gap-2">
                        <div className="flex h-9 flex-1 items-center justify-center rounded-full bg-blue-600 text-[11px] font-semibold text-white">
                            f Facebook
                        </div>
                        <div className="flex h-9 flex-1 items-center justify-center rounded-full bg-sky-500 text-[11px] font-semibold text-white">
                            X / Twitter
                        </div>
                        <div className="flex h-9 flex-1 items-center justify-center rounded-full bg-emerald-500 text-[11px] font-semibold text-white">
                            WhatsApp
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-gray-400">
                        <div className="h-3 w-20 rounded-full bg-gray-100" />
                        <div className="h-3 w-16 rounded-full bg-gray-100" />
                    </div>
                </div>
            );
        }

        // step 3: thanh toán / nhận tiền bằng crypto
        return (
            <div className="w-full max-w-xs rounded-3xl bg-white p-4 shadow-lg">
                <div className="mb-4 flex items-center justify-between">
                    <div className="h-2 w-24 rounded-full bg-gray-200" />
                    <div className="h-2 w-10 rounded-full bg-gray-200" />
                </div>

                <div className="mb-3 h-10 w-full rounded-xl bg-gray-100" />

                <div className="mb-3 rounded-2xl bg-slate-900 p-3 text-xs text-slate-100">
                    <div className="mb-2 flex items-center justify-between">
                        <span className="text-[11px] uppercase tracking-wide text-slate-400">Crypto wallet</span>
                        <span className="h-3 w-10 rounded-full bg-slate-700" />
                    </div>
                    <div className="mb-2 flex items-center justify-between">
                        <span className="text-[13px] font-semibold">0.42 ETH</span>
                        <span className="h-4 w-16 rounded-full bg-emerald-500" />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>≈ $1,500.00</span>
                        <span className="h-3 w-14 rounded-full bg-slate-700" />
                    </div>
                </div>

                <div className="mt-3 flex gap-2">
                    <div className="h-9 flex-1 rounded-xl bg-emerald-500" />
                    <div className="h-9 flex-1 rounded-xl bg-gray-100" />
                </div>
            </div>
        );
    };

    return (
        <div className="relative flex h-[420px] items-center justify-center rounded-3xl bg-green-600 px-6 py-8 shadow-xl">
            {renderContent()}
        </div>
    );
};
