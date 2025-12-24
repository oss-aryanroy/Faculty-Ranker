import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTheme, ThemeToggle } from "./ThemeContext";
import { ChevronDown, ChevronUp, ArrowLeft, Clock, Users, UserPlus, UserMinus, Edit } from "lucide-react";

const API_BASE = import.meta.env.VITE_ENVIRONMENT === 'PRODUCTION'
    ? import.meta.env.VITE_API_BASE_URL
    : "http://localhost:3000";

export default function HistoryPage() {
    const { colors } = useTheme();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedLog, setExpandedLog] = useState(null);

    useEffect(() => {
        fetch(`${API_BASE}/api/history`, {
            credentials: "include",
        })
            .then((res) => res.json())
            .then((json) => {
                if (json?.ok) {
                    setLogs(json.data || []);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short',
            timeZone: 'Asia/Kolkata'
        }).format(date);
    };

    const toggleExpand = (logId) => {
        setExpandedLog(expandedLog === logId ? null : logId);
    };

    return (
        <div className={`min-h-screen bg-gradient-to-b ${colors.gradient} ${colors.text.primary} pb-20 transition-colors duration-500`}>
            {/* Theme Toggle */}
            <div className="absolute top-4 right-4 z-50">
                <ThemeToggle />
            </div>

            {/* Header */}
            <div className="pt-10 px-4">
                <div className="max-w-4xl mx-auto">
                    <Link
                        to="/"
                        className={`inline-flex items-center gap-2 ${colors.text.secondary} ${colors.hover} px-4 py-2 rounded-lg transition-all duration-300 mb-6`}
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Faculty List
                    </Link>

                    <h1 className={`text-3xl sm:text-4xl font-bold ${colors.text.primary}`}>
                        Database Change History
                    </h1>
                    <p className={`mt-4 text-base sm:text-lg ${colors.text.secondary}`}>
                        Track all changes to the faculty database over time
                    </p>
                </div>
            </div>

            {/* Timeline */}
            <div className="max-w-4xl mx-auto mt-10 px-4">
                {loading && (
                    <div className="space-y-6">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div
                                key={i}
                                className={`h-48 ${colors.bg.card} rounded-xl animate-pulse border ${colors.border}`}
                            />
                        ))}
                    </div>
                )}

                {!loading && logs.length === 0 && (
                    <div className={`${colors.bg.card} border ${colors.border} rounded-xl p-12 text-center`}>
                        <Clock className={`w-16 h-16 mx-auto ${colors.text.muted} mb-4`} />
                        <h3 className={`text-xl font-semibold ${colors.text.primary} mb-2`}>
                            No History Yet
                        </h3>
                        <p className={colors.text.secondary}>
                            Change logs will appear here after the ingest script runs
                        </p>
                    </div>
                )}

                {!loading && logs.length > 0 && (
                    <div className="space-y-6 relative">
                        {/* Timeline line - hidden on mobile */}
                        <div className={`hidden sm:block absolute left-8 top-0 bottom-0 w-0.5 ${colors.bg.secondary}`} />

                        {logs.map((log) => {
                            const isExpanded = expandedLog === log._id;
                            const hasChanges = log.deletedCount > 0 || log.addedCount > 0 || log.updatedCount > 0;

                            return (
                                <div key={log._id} className="relative sm:pl-20">
                                    {/* Timeline dot - hidden on mobile */}
                                    <div className={`hidden sm:block absolute left-6 top-6 w-5 h-5 rounded-full ${colors.bg.card} border-4 ${colors.border} z-10`} />

                                    {/* Card */}
                                    <div className={`${colors.bg.card} border ${colors.border} rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl`}>
                                        {/* Header */}
                                        <div className="p-4 sm:p-6">
                                            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                                                <div className="flex-1 w-full">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <Clock className={`w-4 h-4 sm:w-5 sm:h-5 ${colors.text.muted}`} />
                                                        <span className={`text-xs sm:text-sm ${colors.text.secondary}`}>
                                                            {formatDate(log.timestamp)}
                                                        </span>
                                                    </div>

                                                    {/* Stats Grid */}
                                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                                                        <StatBadge
                                                            icon={<Users className="w-4 h-4" />}
                                                            label="Total"
                                                            value={`${log.totalBefore} → ${log.totalAfter}`}
                                                            colors={colors}
                                                        />
                                                        <StatBadge
                                                            icon={<UserPlus className="w-4 h-4" />}
                                                            label="Added"
                                                            value={log.addedCount}
                                                            colors={colors}
                                                            variant="success"
                                                        />
                                                        <StatBadge
                                                            icon={<UserMinus className="w-4 h-4" />}
                                                            label="Deleted"
                                                            value={log.deletedCount}
                                                            colors={colors}
                                                            variant="danger"
                                                        />
                                                        <StatBadge
                                                            icon={<Edit className="w-4 h-4" />}
                                                            label="Updated"
                                                            value={log.updatedCount}
                                                            colors={colors}
                                                            variant="info"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Expand button */}
                                                {hasChanges && (
                                                    <button
                                                        onClick={() => toggleExpand(log._id)}
                                                        className={`w-full sm:w-auto ${colors.button.secondary} px-4 py-2 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105`}
                                                    >
                                                        {isExpanded ? (
                                                            <>
                                                                <ChevronUp className="w-4 h-4" />
                                                                Hide
                                                            </>
                                                        ) : (
                                                            <>
                                                                <ChevronDown className="w-4 h-4" />
                                                                Details
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Expanded Details */}
                                        {isExpanded && (
                                            <div className={`border-t ${colors.border} p-6 space-y-6`}>
                                                {/* Deleted Faculties */}
                                                {log.deletedCount > 0 && (
                                                    <div>
                                                        <h4 className={`text-lg font-semibold ${colors.text.primary} mb-4 flex items-center gap-2`}>
                                                            <UserMinus className="w-5 h-5 text-red-500" />
                                                            Deleted Faculties ({log.deletedCount})
                                                        </h4>
                                                        <div className="space-y-3">
                                                            {log.deletedFaculties.map((faculty) => (
                                                                <FacultyCard key={faculty.emp_id} faculty={faculty} colors={colors} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Added Faculties */}
                                                {log.addedCount > 0 && (
                                                    <div>
                                                        <h4 className={`text-lg font-semibold ${colors.text.primary} mb-4 flex items-center gap-2`}>
                                                            <UserPlus className="w-5 h-5 text-green-500" />
                                                            Added Faculties ({log.addedCount})
                                                        </h4>
                                                        <div className="space-y-3">
                                                            {log.addedFaculties.map((faculty) => (
                                                                <FacultyCard key={faculty.emp_id} faculty={faculty} colors={colors} minimal />
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Updated Count */}
                                                {log.updatedCount > 0 && (
                                                    <div>
                                                        <h4 className={`text-lg font-semibold ${colors.text.primary} mb-2 flex items-center gap-2`}>
                                                            <Edit className="w-5 h-5 text-blue-500" />
                                                            Updated Faculties ({log.updatedCount})
                                                        </h4>
                                                        <p className={`text-sm ${colors.text.secondary}`}>
                                                            {log.updatedCount} faculty {log.updatedCount === 1 ? 'record was' : 'records were'} modified
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

function StatBadge({ icon, label, value, colors, variant = "default" }) {
    const variantStyles = {
        default: `${colors.bg.secondary}`,
        success: "bg-green-500/10 border-green-500/20",
        danger: "bg-red-500/10 border-red-500/20",
        info: "bg-blue-500/10 border-blue-500/20",
    };

    const textStyles = {
        default: colors.text.primary,
        success: "text-green-500",
        danger: "text-red-500",
        info: "text-blue-500",
    };

    return (
        <div className={`${variantStyles[variant]} border ${colors.border} rounded-lg p-2 sm:p-3`}>
            <div className={`flex items-center gap-1 sm:gap-2 ${textStyles[variant]} mb-1`}>
                {icon}
                <span className="text-[10px] sm:text-xs font-medium">{label}</span>
            </div>
            <div className={`text-sm sm:text-lg font-bold ${colors.text.primary}`}>
                {value}
            </div>
        </div>
    );
}

function FacultyCard({ faculty, colors, minimal = false }) {
    return (
        <div className={`${colors.bg.secondary} border ${colors.border} rounded-lg p-4`}>
            <div className="flex items-start gap-4">
                {!minimal && faculty.image && (
                    <img
                        src={faculty.image}
                        alt={faculty.name}
                        className="w-16 h-16 rounded-lg object-cover"
                    />
                )}
                <div className="flex-1 min-w-0">
                    <h5 className={`font-semibold ${colors.text.primary} truncate`}>
                        {faculty.name}
                    </h5>
                    <p className={`text-sm ${colors.text.secondary} truncate`}>
                        {faculty.designation}
                    </p>
                    <p className={`text-sm ${colors.text.muted} truncate`}>
                        {faculty.department}
                    </p>
                    {!minimal && faculty.specialization && faculty.specialization.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                            {faculty.specialization.slice(0, 3).map((spec, i) => (
                                <span
                                    key={i}
                                    className={`text-xs px-2 py-1 rounded ${colors.bg.card} ${colors.text.secondary}`}
                                >
                                    {spec}
                                </span>
                            ))}
                            {faculty.specialization.length > 3 && (
                                <span className={`text-xs px-2 py-1 ${colors.text.muted}`}>
                                    +{faculty.specialization.length - 3} more
                                </span>
                            )}
                        </div>
                    )}
                </div>
                <div className={`text-xs ${colors.text.muted} font-mono`}>
                    #{faculty.emp_id}
                </div>
            </div>
        </div>
    );
}
