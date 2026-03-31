import { ReviewCard } from "./ReviewCard";
import { RatingDistribution } from "./RatingDistribution";
import type { PublicReview } from "@/actions/client/reviews";

type RestaurantReviewsProps = {
  reviews: PublicReview[];
  stats: {
    avgRating: number;
    reviewCount: number;
    distribution: { rating: number; count: number }[];
  };
};

export function RestaurantReviews({ reviews, stats }: RestaurantReviewsProps) {
  if (stats.reviewCount === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">
          Ta restauracja nie ma jeszcze żadnych opinii.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Bądź pierwszą osobą, która zostawi opinię po zamówieniu!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <RatingDistribution
        avgRating={stats.avgRating}
        reviewCount={stats.reviewCount}
        distribution={stats.distribution}
      />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          Ostatnie opinie ({reviews.length})
        </h3>
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            rating={review.rating}
            content={review.content}
            userName={`${review.user.firstName} ${review.user.lastName}`.trim()}
            createdAt={review.createdAt}
          />
        ))}
      </div>
    </div>
  );
}
