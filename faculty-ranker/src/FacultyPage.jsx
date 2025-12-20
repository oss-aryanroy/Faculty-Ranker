import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import StarRow from "./StarRow";
import { useTheme } from "./ThemeContext";
import { useAuth } from "./AuthContext";
import { ArrowLeft, Send, Flag, X, Image, AlertTriangle, Users, MessageCircle, Edit2, Trash2, Check, Shield, Save } from "lucide-react";
import { useToast } from "./Toast";

const API_BASE = import.meta.env.ENVIRONMENT === 'PRODUCTION'
  ? ""
  : import.meta.env.VITE_API_BASE_URL;
const COMMENTS_PAGE_SIZE = 10;

export default function FacultyPage() {
  const { colors } = useTheme();
  const { isLoggedIn, user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const fid = Number(id);
  const toast = useToast();

  const [faculty, setFaculty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditingFaculty, setIsEditingFaculty] = useState(false);
  const [editedFaculty, setEditedFaculty] = useState({ name: "", designation: "", department: "", specialization: "", image: "" });
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState(null);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reviewCount, setReviewCount] = useState(0);
  const [totalComments, setTotalComments] = useState(0);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [moderateConfirmId, setModerateConfirmId] = useState(null);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsPage, setCommentsPage] = useState(1);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [avgRatings, setAvgRatings] = useState({ attendance: 0, leniency: 0, marking: 0 });
  const [userRatings, setUserRatings] = useState({ attendance: 0, leniency: 0, marking: 0 });
  const [hasRated, setHasRated] = useState({ attendance: false, leniency: false, marking: false });
  const [submitting, setSubmitting] = useState(false);
  let isTestNonAdmin = false;

  const reportOptions = [
    { id: 'wrong_image', label: 'Image of faculty is wrong', icon: Image, description: 'The profile picture does not match the faculty member' },
    { id: 'inconsistent_info', label: 'Inconsistent information from website', icon: AlertTriangle, description: 'Faculty details do not match the official website' }
  ];

  const avgOverall = avgRatings.attendance && avgRatings.leniency && avgRatings.marking ? (avgRatings.attendance + avgRatings.leniency + avgRatings.marking) / 3 : 0;
  const canSubmit = hasRated.attendance && hasRated.leniency && hasRated.marking;

  useEffect(() => {
    if (!isLoggedIn || !user) return;
    fetch(`${API_BASE}/api/admin/verify`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => data.ok && setIsAdmin(isTestNonAdmin ? false : data.isAdmin))
      .catch(err => console.error('Failed to check admin status', err));
    
  }, [isLoggedIn, user]);

  const handleStartFacultyEdit = () => {
    setEditedFaculty({
      name: faculty.name,
      designation: faculty.designation,
      department: faculty.department,
      specialization: Array.isArray(faculty.specialization) ? faculty.specialization.join(", ") : faculty.specialization,
      image: faculty.image
    });
    setIsEditingFaculty(true);
  };

  const handleSaveFacultyEdit = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/faculty/${fid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...editedFaculty, specialization: editedFaculty.specialization.split(',').map(s => s.trim()).filter(Boolean) })
      });
      const data = await response.json();
      if (data.ok) {
        setFaculty(data.faculty);
        setIsEditingFaculty(false);
        toast.success('Faculty information updated successfully');
      } else {
        toast.error(data.message || 'Failed to update faculty');
      }
    } catch (error) {
      toast.error('Failed to update faculty');
    }
  };

  const handleModerateComment = (commentId) => setModerateConfirmId(commentId);

  const confirmModerate = async () => {
    if (!moderateConfirmId) return;
    try {
      const response = await fetch(`${API_BASE}/api/admin/comment/${moderateConfirmId}`, { method: 'DELETE', credentials: 'include' });
      const data = await response.json();
      if (data.ok) {
        setComments(prev => prev.filter(c => c._id !== moderateConfirmId));
        setTotalComments(prev => prev - 1);
        toast.success('Comment moderated successfully');
      } else {
        toast.error(data.message || 'Failed to moderate comment');
      }
    } catch (error) {
      toast.error('Failed to moderate comment');
    } finally {
      setModerateConfirmId(null);
    }
  };

  const handleSubmitReport = async () => {
    if (!isLoggedIn) {
      toast.info('Please log in to report an issue.');
      setIsReportOpen(false);
      return;
    }
    if (!selectedReason) {
      toast.error('Please select a reason for reporting.');
      return;
    }
    setIsSubmittingReport(true);
    try {
      const response = await fetch(`${API_BASE}/api/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ facultyId: fid, reason: selectedReason, additionalInfo: additionalInfo.trim() })
      });
      const data = await response.json();
      if (data.ok) {
        toast.success('Report submitted successfully. Thank you for your feedback!');
        setIsReportOpen(false);
        setSelectedReason(null);
        setAdditionalInfo('');
      } else {
        toast.error(data.message || 'Failed to submit report');
      }
    } catch (error) {
      toast.error('An error occurred while submitting your report');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  useEffect(() => {
    setComments([]);
    setCommentsPage(1);
    setHasMoreComments(true);
  }, [fid]);

  useEffect(() => {
    if (!fid) {
      navigate("/");
      return;
    }
    setLoading(true);
    fetch(`${API_BASE}/api/faculty/${fid}`)
      .then((res) => {
        if (!res.ok) throw new Error("Faculty not found");
        return res.json();
      })
      .then((json) => {
        setFaculty(json.data);
        if (json.data.ratings) {
          setAvgRatings({ attendance: json.data.ratings.attendance || 0, leniency: json.data.ratings.leniency || 0, marking: json.data.ratings.marking || 0 });
        }
        setReviewCount(json.data.reviewCount || 0);
        setTotalComments(json.data.totalComments || 0);
      })
      .catch(() => navigate("/"))
      .finally(() => setLoading(false));
  }, [fid, navigate]);

  useEffect(() => {
    if (!fid || !isLoggedIn) return;
    fetch(`${API_BASE}/api/my-rating?facultyId=${fid}`, { credentials: "include" })
      .then((res) => res.json())
      .then((json) => {
        if (json?.ok && json.hasRated) {
          setUserRatings({ attendance: json.rating.attendance, leniency: json.rating.leniency, marking: json.rating.marking });
          setHasRated({ attendance: false, leniency: false, marking: false });
        }
      })
      .catch((err) => console.error("Failed to fetch user rating", err));
  }, [fid, isLoggedIn]);

  useEffect(() => {
    if (!fid) return;
    let cancelled = false;
    async function loadComments() {
      try {
        setCommentsLoading(true);
        const res = await fetch(`${API_BASE}/api/comments?facultyId=${fid}&page=${commentsPage}&limit=${COMMENTS_PAGE_SIZE}`, { credentials: "include" });
        const data = await res.json();
        if (!cancelled && data.ok) {
          setComments(prev => commentsPage === 1 ? data.data : [...prev, ...data.data]);
          if (data.data.length < COMMENTS_PAGE_SIZE) setHasMoreComments(false);
          if (data.total !== undefined && commentsPage === 1) setTotalComments(data.total);
        }
      } catch (err) {
        toast.error("Failed to load comments");
      } finally {
        if (!cancelled) setCommentsLoading(false);
      }
    }
    loadComments();
    return () => { cancelled = true; };
  }, [fid, commentsPage]);

  const handlePost = () => {
    if (!isLoggedIn) {
      toast.info("Please log in to post a comment.");
      return;
    }
    const trimmed = text.trim();
    if (!trimmed) return;
    setText("");
    fetch(`${API_BASE}/api/comment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ facultyId: fid, text: trimmed }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json?.ok) {
          const newComment = json.comment || json.data || { _id: Date.now().toString(), text: trimmed, createdAt: new Date().toISOString() };
          setComments((prev) => [newComment, ...prev]);
          setTotalComments(prev => prev + 1);
          toast.success("Comment posted");
        } else {
          toast.error(json.message || "Failed to post comment");
        }
      })
      .catch((err) => toast.error("Failed to post comment"));
  };

  const handleStartEdit = (comment) => {
    setEditingCommentId(comment._id);
    setEditText(comment.text);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditText("");
  };

  const handleSaveEdit = (commentId) => {
    const trimmed = editText.trim();
    if (!trimmed) return;
    fetch(`${API_BASE}/api/comment/${commentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ text: trimmed }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json?.ok) {
          setComments((prev) => prev.map((c) => c._id === commentId ? { ...c, text: trimmed, updatedAt: new Date().toISOString() } : c));
          setEditingCommentId(null);
          setEditText("");
          toast.success("Comment updated");
        } else {
          toast.error(json.message || "Failed to update comment");
        }
      })
      .catch((err) => toast.error("Failed to update comment"));
  };

  const handleDeleteComment = (commentId) => setDeleteConfirmId(commentId);

  const confirmDelete = () => {
    if (!deleteConfirmId) return;
    fetch(`${API_BASE}/api/comment/${deleteConfirmId}`, { method: "DELETE", credentials: "include" })
      .then((res) => res.json())
      .then((json) => {
        if (json?.ok) {
          setComments((prev) => prev.filter((c) => c._id !== deleteConfirmId));
          setTotalComments(prev => prev - 1);
          toast.success("Comment deleted");
        } else {
          toast.error(json.message || "Failed to delete comment");
        }
      })
      .catch((err) => toast.error("Failed to delete comment"))
      .finally(() => setDeleteConfirmId(null));
  };

  const cancelDelete = () => setDeleteConfirmId(null);

  const handleRate = (category, value) => {
    if (!isLoggedIn) {
      toast.info("Please log in to rate this faculty.");
      return;
    }
    setUserRatings((prev) => ({ ...prev, [category]: value }));
    setHasRated((prev) => ({ ...prev, [category]: true }));
  };

  const handleSubmitRatings = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/api/faculty/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ facultyId: fid, ratings: userRatings }),
      });
      const json = await response.json();
      if (json.ok && json.updatedRatings) {
        setAvgRatings(json.updatedRatings);
        setHasRated({ attendance: false, leniency: false, marking: false });
        if (json.reviewCount !== undefined) setReviewCount(json.reviewCount);
        toast.success(json.isUpdate ? "Your rating has been updated!" : "Thank you! Your rating has been submitted.");
      } else {
        toast.error(json.message || "Failed to submit rating. Contact the developer!");
      }
    } catch (error) {
      toast.error("An error occurred while submitting your rating.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className={`min-h-screen flex items-center justify-center ${colors.text.primary} bg-gradient-to-b ${colors.gradient} transition-colors duration-500`}>Loading faculty…</div>;
  }

  if (!faculty) return null;

  return (
    <div className={`min-h-screen bg-gradient-to-b ${colors.gradient} ${colors.text.primary} pb-20 transition-colors duration-500`}>
      <div className="pt-12 sm:pt-16 max-w-4xl mx-auto px-3 sm:px-4">
        <Link to="/" className={`inline-flex items-center gap-2 ${colors.text.primary} hover:opacity-70 transition-all duration-300 mb-4 sm:mb-6 group`}>
          <div className={`p-2 rounded-full ${colors.bg.card} border ${colors.border} group-hover:scale-110 transition-transform duration-300`}>
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="font-medium text-sm sm:text-base">Back to list</span>
        </Link>

        <div className={`${colors.bg.card} border ${colors.border} rounded-xl p-4 sm:p-6 shadow-lg transition-colors duration-300`}>

          <div className="flex flex-row gap-4 sm:gap-6">
            <div className={`w-24 h-32 sm:w-28 sm:h-40 overflow-hidden rounded-md border ${colors.border} ${colors.bg.secondary} flex-shrink-0`}>
              {isEditingFaculty ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-2">
                  <input type="text" value={editedFaculty.image} onChange={(e) => setEditedFaculty(prev => ({ ...prev, image: e.target.value }))} placeholder="Image URL" className={`w-full text-xs ${colors.bg.input} ${colors.text.primary} border ${colors.border} rounded p-1`} />
                </div>
              ) : (
                <img src={faculty.image} alt={faculty.name} className="w-full h-full object-cover" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
                <div className="flex-1 w-full min-w-0">
                  {isEditingFaculty ? (
                    <div className="space-y-3">
                      <input type="text" value={editedFaculty.name} onChange={(e) => setEditedFaculty(prev => ({ ...prev, name: e.target.value }))} className={`w-full text-lg sm:text-xl font-semibold ${colors.bg.input} ${colors.text.primary} border ${colors.border} rounded-md p-2`} placeholder="Faculty Name" />
                      <input type="text" value={editedFaculty.designation} onChange={(e) => setEditedFaculty(prev => ({ ...prev, designation: e.target.value }))} className={`w-full text-sm ${colors.bg.input} ${colors.text.secondary} border ${colors.border} rounded-md p-2`} placeholder="Designation" />
                      <input type="text" value={editedFaculty.department} onChange={(e) => setEditedFaculty(prev => ({ ...prev, department: e.target.value }))} className={`w-full text-xs ${colors.bg.input} ${colors.text.muted} border ${colors.border} rounded-md p-2`} placeholder="Department" />
                      <textarea value={editedFaculty.specialization} onChange={(e) => setEditedFaculty(prev => ({ ...prev, specialization: e.target.value }))} className={`w-full text-sm ${colors.bg.input} ${colors.text.secondary} border ${colors.border} rounded-md p-2 resize-none`} placeholder="Specialization (comma-separated)" rows={2} />
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button onClick={handleSaveFacultyEdit} className={`flex items-center justify-center gap-2 px-4 py-2 rounded-full ${colors.button.primary} transition-all duration-300 hover:scale-105`}>
                          <Save className="w-4 h-4" />
                          Save Changes
                        </button>
                        <button onClick={() => setIsEditingFaculty(false)} className={`px-4 py-2 rounded-full ${colors.bg.secondary} border ${colors.border} ${colors.text.secondary} transition-all duration-300 hover:opacity-70`}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h1 className={`text-lg sm:text-2xl font-semibold ${colors.text.primary}`}>{faculty.name}</h1>
                      <p className={`text-xs sm:text-sm ${colors.text.secondary} mt-1`}>{faculty.designation}</p>
                      <p className={`text-xs ${colors.text.muted} mt-0.5 sm:mt-1`}>{faculty.department}</p>
                      <p className={`mt-2 sm:mt-3 text-xs sm:text-sm ${colors.text.secondary} line-clamp-2 sm:line-clamp-3`}>{Array.isArray(faculty.specialization) ? faculty.specialization.join(", ") : faculty.specialization}</p>
                      
                      {/* Mobile: badges below text */}
                      <div className="flex sm:hidden flex-wrap gap-2 mt-3">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs ${reviewCount > 0 ? 'bg-blue-500/10 border border-blue-500/30' : `${colors.bg.secondary} border ${colors.border}`}`}>
                          <Users className={`w-3.5 h-3.5 ${reviewCount > 0 ? 'text-blue-400' : colors.text.muted}`} />
                          <span className={`font-medium ${reviewCount > 0 ? 'text-blue-400' : colors.text.muted}`}>{reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}</span>
                        </div>
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs ${totalComments > 0 ? 'bg-purple-500/10 border border-purple-500/30' : `${colors.bg.secondary} border ${colors.border}`}`}>
                          <MessageCircle className={`w-3.5 h-3.5 ${totalComments > 0 ? colors.text.secondary : colors.text.muted}`} />
                          <span className={`font-medium ${totalComments > 0 ? colors.text.secondary : colors.text.muted}`}>{totalComments} {totalComments === 1 ? 'comment' : 'comments'}</span>
                        </div>
                      </div>

                      {/* Desktop: badges inline with text */}
                      <div className="hidden sm:flex flex-wrap gap-2 mt-3">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${reviewCount > 0 ? 'bg-blue-500/10 border border-blue-500/30' : `${colors.bg.secondary} border ${colors.border}`}`}>
                          <Users className={`w-4 h-4 ${reviewCount > 0 ? 'text-blue-400' : colors.text.muted}`} />
                          <span className={`text-sm font-medium ${reviewCount > 0 ? 'text-blue-400' : colors.text.muted}`}>{reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}</span>
                        </div>
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${totalComments > 0 ? 'bg-purple-500/10 border border-purple-500/30' : `${colors.bg.secondary} border ${colors.border}`}`}>
                          <MessageCircle className={`w-4 h-4 ${totalComments > 0 ? colors.text.secondary : colors.text.muted}`} />
                          <span className={`text-sm font-medium ${totalComments > 0 ? colors.text.secondary : colors.text.muted}`}>{totalComments} {totalComments === 1 ? 'comment' : 'comments'}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Desktop: buttons on the right */}
                {!isEditingFaculty && (
                  <div className="hidden sm:flex flex-col gap-2">
                    {isAdmin && (
                      <button onClick={handleStartFacultyEdit} className={`flex items-center justify-center gap-2 px-4 py-2 rounded-full ${colors.bg.secondary} border ${colors.border} ${colors.text.secondary} hover:scale-105 hover:${colors.text.primary} transition-all duration-300 shadow-md hover:shadow-lg whitespace-nowrap`} title="Edit faculty information">
                        <Edit2 className="w-4 h-4" />
                        <span className="text-sm font-medium">Edit</span>
                      </button>
                    )}
                    <button onClick={() => setIsReportOpen(true)} className={`flex items-center justify-center gap-2 px-4 py-2 rounded-full ${colors.bg.secondary} border ${colors.border} ${colors.text.secondary} hover:scale-105 hover:${colors.text.primary} transition-all duration-300 shadow-md hover:shadow-lg whitespace-nowrap`} title="Report an issue">
                      <Flag className="w-4 h-4" />
                      <span className="text-sm font-medium">Report</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile: buttons at bottom */}
              {!isEditingFaculty && (
                <div className="flex sm:hidden gap-2 w-full mt-3">
                  {isAdmin && (
                    <button onClick={handleStartFacultyEdit} className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-full ${colors.bg.secondary} border ${colors.border} ${colors.text.secondary} hover:scale-105 hover:${colors.text.primary} transition-all duration-300 shadow-md hover:shadow-lg text-sm`} title="Edit faculty information">
                      <Edit2 className="w-3.5 h-3.5" />
                      <span className="font-medium">Edit</span>
                    </button>
                  )}
                  <button onClick={() => setIsReportOpen(true)} className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-full ${colors.bg.secondary} border ${colors.border} ${colors.text.secondary} hover:scale-105 hover:${colors.text.primary} transition-all duration-300 shadow-md hover:shadow-lg text-sm`} title="Report an issue">
                    <Flag className="w-3.5 h-3.5" />
                    <span className="font-medium">Report</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {!isEditingFaculty && (
            <div className={`mt-4 sm:mt-6 ${colors.bg.secondary} p-3 sm:p-4 rounded-md border ${colors.border}`}>
              <h2 className={`text-base sm:text-lg font-semibold mb-3 ${colors.text.primary}`}>Ratings</h2>
              {["attendance", "leniency", "marking"].map((k) => (
                <div key={k} className="mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <div className={`capitalize ${colors.text.secondary} font-medium text-sm sm:text-base`}>{k}</div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                    <div className="flex-1 w-full">
                      <div className={`text-xs ${colors.text.muted} mb-1`}>Community Average</div>
                      <StarRow rating={avgRatings[k]} isInteractive={false} />
                    </div>
                    <div className="flex-1 w-full">
                      <div className={`text-xs ${colors.text.muted} mb-1`}>Your Rating</div>
                      <StarRow rating={userRatings[k]} onRate={(v) => handleRate(k, v)} isInteractive={true} />
                    </div>
                  </div>
                </div>
              ))}
              <div className={`pt-3 border-t ${colors.border} flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0`}>
                <div>
                  <div className={`font-semibold ${colors.text.primary}`}>Overall Average</div>
                  <div className="text-amber-400 font-bold text-xl mt-1">{avgOverall > 0 ? avgOverall.toFixed(1) : "N/A"} {avgOverall > 0 && "★"}</div>
                </div>
                <button onClick={handleSubmitRatings} disabled={!canSubmit || submitting} className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full font-medium transition-all duration-300 shadow-lg ${canSubmit && !submitting ? `${colors.button.primary} hover:scale-105 cursor-pointer` : `${colors.bg.secondary} ${colors.text.muted} cursor-not-allowed opacity-50`}`}>
                  {submitting ? (<><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /><span>Submitting...</span></>) : (<><Send className="w-4 h-4" /><span>Submit Rating</span></>)}
                </button>
              </div>
            </div>
          )}

          {!isEditingFaculty && (
            <div className="mt-4 sm:mt-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className={`text-base sm:text-lg font-semibold ${colors.text.primary} flex items-center gap-2`}>
                  Comments
                  {totalComments > 0 && <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 border border-purple-500/30`}>{totalComments}</span>}
                </h2>
              </div>
              <div className={`mt-3 ${colors.bg.secondary} p-3 sm:p-4 rounded-lg border ${colors.border}`}>
                <textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder={isLoggedIn ? "Share your experience…" : "Log in to post a comment…"} className={`w-full ${colors.bg.input} ${colors.text.primary} border ${colors.border} rounded-md p-3 resize-none transition-colors duration-300 focus:outline-none focus:ring-2 text-sm`} />
                <div className="flex justify-between mt-3 items-center">
                  <div className={`text-xs ${colors.text.muted}`}>Be respectful. No personal info.</div>
                  <button onClick={handlePost} className={`${colors.button.primary} px-3 sm:px-4 py-1.5 sm:py-2 rounded-md transition-all duration-300 hover:scale-105 text-sm`}>Post</button>
                </div>
              </div>
              <div className="mt-6 space-y-4">
                {commentsLoading && <div className={colors.text.muted}>Loading comments…</div>}
                {!commentsLoading && comments.length === 0 && <div className={colors.text.muted}>No comments yet.</div>}
                {comments.map((c) => {
                  const isEditing = editingCommentId === c._id;
                  const isOwner = user && c.userId === user.id;
                  return (
                    <div key={c._id} className={`${colors.bg.secondary} border ${colors.border} p-3 rounded-md transition-colors duration-300`}>
                      {isEditing ? (
                        <div>
                          <textarea value={editText} onChange={(e) => setEditText(e.target.value)} rows={3} className={`w-full ${colors.bg.input} ${colors.text.primary} border ${colors.border} rounded-md p-2 resize-none transition-colors duration-300 focus:outline-none focus:ring-2`} />
                          <div className="flex gap-2 mt-2">
                            <button onClick={() => handleSaveEdit(c._id)} className={`flex items-center gap-1 px-3 py-1 rounded-md ${colors.button.primary} text-xs transition-all duration-300 hover:scale-105`}>
                              <Check className="w-3 h-3" />
                              Save
                            </button>
                            <button onClick={handleCancelEdit} className={`px-3 py-1 rounded-md ${colors.bg.card} border ${colors.border} ${colors.text.secondary} text-xs transition-all duration-300 hover:opacity-70`}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <div className={`text-sm ${colors.text.secondary} flex-1`}>{c.text}</div>
                            <div className="flex gap-1">
                              {isLoggedIn && isOwner && (
                                <>
                                  <button onClick={() => handleStartEdit(c)} className={`p-1.5 rounded-md ${colors.bg.card} border ${colors.border} ${colors.text.secondary} hover:${colors.text.primary} transition-all duration-300 hover:scale-110`} title="Edit comment">
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={() => handleDeleteComment(c._id)} className={`p-1.5 rounded-md ${colors.bg.card} border ${colors.border} text-red-400 hover:text-red-300 transition-all duration-300 hover:scale-110`} title="Delete comment">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                              {isAdmin && !isOwner && (
                                <button onClick={() => handleModerateComment(c._id)} className={`p-1.5 rounded-md ${colors.bg.card} border border-orange-500/30 text-orange-400 hover:text-orange-300 transition-all duration-300 hover:scale-110`} title="Moderate comment">
                                  <Shield className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                          <div className={`text-xs ${colors.text.muted} mt-1`}>
                            {new Date(c.createdAt).toLocaleString()}
                            {c.updatedAt && c.updatedAt !== c.createdAt && <span className="ml-2">(edited)</span>}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                {hasMoreComments && !commentsLoading && comments.length > 0 && (
                  <div className="flex justify-center pt-4">
                    <button onClick={() => setCommentsPage((p) => p + 1)} className={`${colors.button.primary} px-6 py-2 rounded-full transition-all duration-300 hover:scale-105`}>Load more</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {isReportOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setIsReportOpen(false)}>
          <div className={`${colors.bg.card} border ${colors.border} rounded-2xl max-w-md w-full shadow-2xl transform transition-all duration-300`} onClick={(e) => e.stopPropagation()}>
            <div className={`flex items-center justify-between p-6 border-b ${colors.border}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${colors.bg.secondary}`}>
                  <Flag className={`w-5 h-5 ${colors.text.primary}`} />
                </div>
                <h3 className={`text-xl font-semibold ${colors.text.primary}`}>Report Issue</h3>
              </div>
              <button onClick={() => setIsReportOpen(false)} className={`p-2 rounded-full ${colors.bg.secondary} ${colors.text.muted} hover:${colors.text.primary} transition-all duration-200 hover:scale-110`}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className={`text-sm ${colors.text.secondary}`}>Please select the type of issue you'd like to report:</p>
              <div className="space-y-3">
                {reportOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = selectedReason === option.id;
                  return (
                    <button key={option.id} onClick={() => setSelectedReason(option.id)} className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 ${isSelected ? `${colors.border} bg-blue-500/10 border-blue-500` : `${colors.border} ${colors.bg.secondary} hover:${colors.bg.hover}`}`}>
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-500/20' : colors.bg.primary}`}>
                          <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-500' : colors.text.secondary}`} />
                        </div>
                        <div className="flex-1">
                          <div className={`font-medium ${colors.text.primary} mb-1`}>{option.label}</div>
                          <div className={`text-xs ${colors.text.muted}`}>{option.description}</div>
                        </div>
                        {isSelected && (
                          <div className="flex-shrink-0">
                            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            </div>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
              <div>
                <label className={`block text-sm font-medium ${colors.text.secondary} mb-2`}>Additional information (optional)</label>
                <textarea value={additionalInfo} onChange={(e) => setAdditionalInfo(e.target.value)} placeholder="Provide any additional details..." rows={3} className={`w-full ${colors.bg.input} border ${colors.border} rounded-lg p-3 text-sm ${colors.text.primary} resize-none transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500`} />
              </div>
            </div>
            <div className={`flex gap-3 p-6 border-t ${colors.border}`}>
              <button onClick={() => setIsReportOpen(false)} className={`flex-1 px-4 py-3 rounded-xl font-medium ${colors.bg.secondary} ${colors.text.primary} hover:opacity-80 transition-all duration-300`}>Cancel</button>
              <button onClick={handleSubmitReport} disabled={!selectedReason || isSubmittingReport} className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${selectedReason && !isSubmittingReport ? `${colors.button.primary} hover:scale-[1.02] shadow-lg` : `${colors.bg.secondary} ${colors.text.muted} cursor-not-allowed opacity-50`}`}>
                {isSubmittingReport ? (<div className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /><span>Submitting...</span></div>) : ('Submit Report')}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={cancelDelete}>
          <div className={`${colors.bg.card} border ${colors.border} rounded-2xl max-w-md w-full shadow-2xl transform transition-all duration-300`} onClick={(e) => e.stopPropagation()}>
            <div className={`flex items-center justify-between p-6 border-b ${colors.border}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full bg-red-500/10`}>
                  <Trash2 className={`w-5 h-5 text-red-400`} />
                </div>
                <h3 className={`text-xl font-semibold ${colors.text.primary}`}>Delete Comment</h3>
              </div>
              <button onClick={cancelDelete} className={`p-2 rounded-full ${colors.bg.secondary} ${colors.text.muted} hover:${colors.text.primary} transition-all duration-200 hover:scale-110`}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className={`${colors.text.secondary}`}>Are you sure you want to delete this comment? This action cannot be undone.</p>
            </div>
            <div className={`flex gap-3 p-6 border-t ${colors.border}`}>
              <button onClick={cancelDelete} className={`flex-1 px-4 py-3 rounded-xl font-medium ${colors.bg.secondary} ${colors.text.primary} hover:opacity-80 transition-all duration-300`}>Cancel</button>
              <button onClick={confirmDelete} className={`flex-1 px-4 py-3 rounded-xl font-medium bg-red-500 text-white hover:bg-red-600 transition-all duration-300 hover:scale-[1.02] shadow-lg`}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {moderateConfirmId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setModerateConfirmId(null)}>
          <div className={`${colors.bg.card} border ${colors.border} rounded-2xl max-w-md w-full shadow-2xl transform transition-all duration-300`} onClick={(e) => e.stopPropagation()}>
            <div className={`flex items-center justify-between p-6 border-b ${colors.border}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full bg-orange-500/10`}>
                  <Shield className={`w-5 h-5 text-orange-400`} />
                </div>
                <h3 className={`text-xl font-semibold ${colors.text.primary}`}>Moderate Comment</h3>
              </div>
              <button onClick={() => setModerateConfirmId(null)} className={`p-2 rounded-full ${colors.bg.secondary} ${colors.text.muted} hover:${colors.text.primary} transition-all duration-200 hover:scale-110`}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className={`${colors.text.secondary}`}>As an admin, you are about to remove this comment. This action cannot be undone.</p>
            </div>
            <div className={`flex gap-3 p-6 border-t ${colors.border}`}>
              <button onClick={() => setModerateConfirmId(null)} className={`flex-1 px-4 py-3 rounded-xl font-medium ${colors.bg.secondary} ${colors.text.primary} hover:opacity-80 transition-all duration-300`}>Cancel</button>
              <button onClick={confirmModerate} className={`flex-1 px-4 py-3 rounded-xl font-medium bg-orange-500 text-white hover:bg-orange-600 transition-all duration-300 hover:scale-[1.02] shadow-lg`}>Moderate</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}