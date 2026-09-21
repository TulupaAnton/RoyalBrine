import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { REVIEWS } from "../../data/reviews";

export function ReviewsPage() {
  return (
    <section className="min-h-screen bg-[#FDFCFB] pt-32 pb-20">
      <div className="container mx-auto px-6">
        <h1 className="text-4xl lg:text-6xl font-black text-[#2D241E] mb-12 tracking-tighter">
          Відгуки наших клієнтів
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {REVIEWS.map((review) => (
            <div
              key={review.id}
              className="bg-white p-8 rounded-[2rem] shadow-lg shadow-gray-200/40 border border-gray-50"
            >
              <div className="flex text-orange-400 gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <FontAwesomeIcon
                    key={i}
                    icon={faStar}
                    className="text-[10px]"
                  />
                ))}
              </div>
              <p className="text-[#2D241E] italic leading-snug mb-4">
                "{review.text}"
              </p>
              <span className="text-xs font-bold uppercase tracking-widest text-orange-900/40">
                {review.author}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
