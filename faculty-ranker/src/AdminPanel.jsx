import React, { useState, useEffect } from 'react';
import { Shield, AlertCircle, CheckCircle, XCircle, Clock, Eye, FileText, ChevronLeft, ChevronRight } from 'lucide-react';


const API_BASE = import.meta.env.ENVIRONMENT === 'PRODUCTION'
  ? ""
  : import.meta.env.VITE_API_BASE_URL;

export default function AdminPanel() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [facultyMap, setFacultyMap] = useState({});
  const [selectedReport, setSelectedReport] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    pending: 0,
    reviewed: 0,
    resolved: 0,
    dismissed: 0
  });

  useEffect(() => {
    fetch(`${API_BASE}/api/admin/verify`, {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        console.log(data);
        setIsAdmin(data.ok && data.isAdmin);
        setLoading(false);
      })
      .catch(() => {
        setIsAdmin(false);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!isAdmin) return;

    const params = new URLSearchParams({
      page: page.toString(),
      limit: '10',
      status: statusFilter === 'all' ? '' : statusFilter
    });

    fetch(`${API_BASE}/api/admin/reports?${params}`, {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (data.ok) {
          setReports(data.reports || []);
          setTotalPages(data.totalPages || 1);
          setStats(data.stats || stats);
          
          const facultyIds = [...new Set(data.reports.map(r => r.facultyId))];
          fetchFacultyDetails(facultyIds);
        }
      })
      .catch(console.error);
  }, [isAdmin, page, statusFilter]);

  const fetchFacultyDetails = async (ids) => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/faculty-details`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ facultyIds: ids })
      });
      const data = await response.json();
      if (data.ok) {
        setFacultyMap(data.facultyMap || {});
      }
    } catch (error) {
      console.error('Failed to fetch faculty details:', error);
    }
  };

  const updateReportStatus = async (reportId, status, reviewNotes = '') => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status, reviewNotes })
      });
      
      const data = await response.json();
      if (data.ok) {
        setReports(prev => prev.map(r => 
          r._id === reportId ? { ...r, status, reviewNotes, reviewedAt: new Date() } : r
        ));
        setSelectedReport(null);
      }
    } catch (error) {
      console.error('Failed to update report:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 max-w-md text-center">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-slate-300">You do not have permission to access this admin panel.</p>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'reviewed': return <Eye className="w-5 h-5 text-blue-400" />;
      case 'resolved': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'dismissed': return <XCircle className="w-5 h-5 text-red-400" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getReasonLabel = (reason) => {
    switch (reason) {
      case 'wrong_image': return 'Wrong Image';
      case 'inconsistent_info': return 'Inconsistent Information';
      default: return reason;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-8 h-8 text-blue-400" />
          <h1 className="text-3xl font-bold">Admin Panel</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {Object.entries(stats).map(([key, value]) => (
            <div key={key} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm capitalize">{key}</p>
                  <p className="text-3xl font-bold mt-1">{value}</p>
                </div>
                {getStatusIcon(key)}
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {['all', 'pending', 'reviewed', 'resolved', 'dismissed'].map(status => (
              <button
                key={status}
                onClick={() => {
                  setStatusFilter(status);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  statusFilter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Faculty</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Reason</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-slate-400">
                      No reports found
                    </td>
                  </tr>
                ) : (
                  reports.map(report => {
                    const faculty = facultyMap[report.facultyId];
                    return (
                      <tr key={report._id} className="hover:bg-slate-700/30 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-white">
                              {faculty?.name || `ID: ${report.facultyId}`}
                            </div>
                            {faculty?.department && (
                              <div className="text-sm text-slate-400">{faculty.department}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-700 text-slate-300 text-sm">
                            {getReasonLabel(report.reason)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-2">
                            {getStatusIcon(report.status)}
                            <span className="capitalize text-sm">{report.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-400">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setSelectedReport(report)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm font-medium"
                          >
                            <FileText className="w-4 h-4" />
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-700">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <span className="text-slate-400">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedReport(null)}
        >
          <div
            className="bg-slate-800 border border-slate-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Report Details</h2>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Faculty Info */}
              <div>
                <h3 className="text-sm font-semibold text-slate-400 mb-2">Faculty Information</h3>
                <div className="bg-slate-700/50 rounded-lg p-4">
                  <p className="text-white font-medium">
                    {facultyMap[selectedReport.facultyId]?.name || `Faculty ID: ${selectedReport.facultyId}`}
                  </p>
                  {facultyMap[selectedReport.facultyId]?.department && (
                    <p className="text-slate-400 text-sm mt-1">
                      {facultyMap[selectedReport.facultyId].department}
                    </p>
                  )}
                </div>
              </div>

              {/* Report Info */}
              <div>
                <h3 className="text-sm font-semibold text-slate-400 mb-2">Report Information</h3>
                <div className="bg-slate-700/50 rounded-lg p-4 space-y-3">
                  <div>
                    <span className="text-slate-400 text-sm">Reason:</span>
                    <p className="text-white mt-1">{getReasonLabel(selectedReport.reason)}</p>
                  </div>
                  {selectedReport.additionalInfo && (
                    <div>
                      <span className="text-slate-400 text-sm">Additional Information:</span>
                      <p className="text-white mt-1">{selectedReport.additionalInfo}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-slate-400 text-sm">Status:</span>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusIcon(selectedReport.status)}
                      <span className="text-white capitalize">{selectedReport.status}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-sm">Submitted:</span>
                    <p className="text-white mt-1">
                      {new Date(selectedReport.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Review Notes */}
              {selectedReport.reviewNotes && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 mb-2">Review Notes</h3>
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <p className="text-white">{selectedReport.reviewNotes}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div>
                <h3 className="text-sm font-semibold text-slate-400 mb-2">Update Status</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => updateReportStatus(selectedReport._id, 'reviewed')}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Mark as Reviewed
                  </button>
                  <button
                    onClick={() => updateReportStatus(selectedReport._id, 'resolved')}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark as Resolved
                  </button>
                  <button
                    onClick={() => updateReportStatus(selectedReport._id, 'dismissed')}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    Dismiss Report
                  </button>
                  <button
                    onClick={() => updateReportStatus(selectedReport._id, 'pending')}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors"
                  >
                    <Clock className="w-4 h-4" />
                    Mark as Pending
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}