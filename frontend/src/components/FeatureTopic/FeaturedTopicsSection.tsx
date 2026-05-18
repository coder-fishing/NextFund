import { heroTopic, topics } from "@/const/topic";
import { TopicCard } from "./ToppicCard";

export const FeaturedTopicsSection = () => {
	return (
		<section className="py-16 bg-white dark:bg-[#1C1C1D] dark:text-[#E6EBEF]">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
					Featured topics
				</h2>

				<div className="mt-8">
					<TopicCard {...heroTopic} />
				</div>

				<div className="mt-8 grid gap-6 md:grid-cols-3">
					{topics.map((topic) => (
						<TopicCard
							key={topic.title}
							{...topic}
							variant="small"
						/>
					))}
				</div>
			</div>
		</section>
	);
};
