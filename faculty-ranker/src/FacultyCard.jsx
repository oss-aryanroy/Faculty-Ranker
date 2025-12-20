import { useTheme } from "./ThemeContext";
import { Users } from "lucide-react";

export default function FacultyCard({ faculty, isClickable = false }) {
  const { colors } = useTheme();

  const ratings = faculty.ratings || {
    attendance: 0,
    leniency: 0,
    marking: 0
  };

  const reviewCount = faculty.reviewCount || 0;

  const overall = ratings.attendance && ratings.leniency && ratings.marking
    ? ((ratings.attendance + ratings.leniency + ratings.marking) / 3).toFixed(1)
    : "N/A";

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-1">
        {[...Array(fullStars)].map((_, i) => (
          <span key={`full-${i}`} className="text-amber-400">★</span>
        ))}
        {hasHalfStar && <span className="text-amber-400">⯨</span>}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={`empty-${i}`} className="text-gray-600">★</span>
        ))}
        <span className={`ml-2 text-sm ${colors.text.secondary}`}>
          {rating > 0 ? rating.toFixed(1) : "N/A"}
        </span>
      </div>
    );
  };

  return (
    <div
      className={`
        ${colors.bg.card} border ${colors.border} rounded-xl p-4 
        transition-all duration-300 shadow-lg
        h-full flex flex-col
        ${isClickable ? "hover:scale-105 hover:shadow-2xl cursor-pointer" : ""}
      `}
    >
      {/* Faculty Image & Info */}
      <div className="flex gap-4 mb-4">
        <div className={`w-20 h-24 overflow-hidden rounded-md border ${colors.border} ${colors.bg.secondary} flex-shrink-0`}>
          <img
            src={faculty.image}
            alt={faculty.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold ${colors.text.primary} text-sm h-10 line-clamp-2 overflow-hidden`}>
            {faculty.name}
          </h3>
          <p className={`text-xs ${colors.text.secondary} mt-1 line-clamp-1`}>
            {faculty.designation}
          </p>
          <p className={`text-xs ${colors.text.muted} mt-0.5 line-clamp-1`}>
            {faculty.department}
          </p>

          {/* Review Count Badge */}
          <div className="mt-2">
            <div className={`
              inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
              ${reviewCount > 0 
                ? 'bg-blue-500/10 border border-blue-500/30' 
                : `${colors.bg.secondary} border ${colors.border}`
              }
            `}>
              <Users className={`w-3 h-3 ${reviewCount > 0 ? 'text-blue-400' : colors.text.muted}`} />
              <span className={`text-xs font-medium ${reviewCount > 0 ? 'text-blue-400' : colors.text.muted}`}>
                {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Ratings */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className={`text-sm ${colors.text.secondary}`}>Attendance</span>
          {renderStars(ratings.attendance)}
        </div>

        <div className="flex justify-between items-center">
          <span className={`text-sm ${colors.text.secondary}`}>Leniency</span>
          {renderStars(ratings.leniency)}
        </div>

        <div className="flex justify-between items-center">
          <span className={`text-sm ${colors.text.secondary}`}>Marking</span>
          {renderStars(ratings.marking)}
        </div>
      </div>

      {/* Overall - Pushed to bottom */}
      <div className={`pt-3 mt-3 border-t ${colors.border} flex justify-between items-center`}>
        <span className={`font-semibold ${colors.text.primary}`}>Overall</span>
        <span className="text-amber-400 font-bold text-lg">
          {overall !== "N/A" ? `${overall} ★` : "N/A"}
        </span>
      </div>
    </div>
  );
}