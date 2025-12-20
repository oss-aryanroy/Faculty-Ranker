import { useState } from 'react';
import { Flag, X, Image, AlertTriangle } from 'lucide-react';
import { useTheme } from './ThemeContext';
import { useToast } from './Toast';

const API_BASE = import.meta.env.ENVIRONMENT === 'PRODUCTION'
  ? ""
  : import.meta.env.VITE_API_BASE_URL;
console.log(API_BASE);

export default function ReportButton({ facultyId, isLoggedIn }) {
  const { colors } = useTheme();
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState(null);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reportOptions = [
    {
      id: 'wrong_image',
      label: 'Image of faculty is wrong',
      icon: Image,
      description: 'The profile picture does not match the faculty member'
    },
    {
      id: 'inconsistent_info',
      label: 'Inconsistent information from website',
      icon: AlertTriangle,
      description: 'Faculty details do not match the official website'
    }
  ];

  const handleSubmit = async () => {
    if (!isLoggedIn) {
      toast.info('Please log in to report an issue.');
      setIsOpen(false);
      return;
    }

    if (!selectedReason) {
      toast.error('Please select a reason for reporting.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE}/api/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          facultyId,
          reason: selectedReason,
          additionalInfo: additionalInfo.trim()
        })
      });

      const data = await response.json();

      if (data.ok) {
        toast.success('Report submitted successfully. Thank you for your feedback!');
        setIsOpen(false);
        setSelectedReason(null);
        setAdditionalInfo('');
      } else {
        toast.error(data.message || 'Failed to submit report');
      }
    } catch (error) {
      console.error('Report submission error:', error);
      toast.error('An error occurred while submitting your report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Report Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-full
          ${colors.bg.secondary} border ${colors.border}
          ${colors.text.secondary}
          hover:scale-105 hover:${colors.text.primary}
          transition-all duration-300 shadow-md hover:shadow-lg
        `}
        title="Report an issue"
      >
        <Flag className="w-4 h-4" />
        <span className="text-sm font-medium">Report</span>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          {/* Modal Content */}
          <div
            className={`
              ${colors.bg.card} border ${colors.border} rounded-2xl
              max-w-md w-full shadow-2xl
              transform transition-all duration-300
            `}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`flex items-center justify-between p-6 border-b ${colors.border}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${colors.bg.secondary}`}>
                  <Flag className={`w-5 h-5 ${colors.text.primary}`} />
                </div>
                <h3 className={`text-xl font-semibold ${colors.text.primary}`}>
                  Report Issue
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className={`
                  p-2 rounded-full ${colors.bg.secondary}
                  ${colors.text.muted} hover:${colors.text.primary}
                  transition-all duration-200 hover:scale-110
                `}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <p className={`text-sm ${colors.text.secondary}`}>
                Please select the type of issue you'd like to report:
              </p>

              {/* Report Options */}
              <div className="space-y-3">
                {reportOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = selectedReason === option.id;

                  return (
                    <button
                      key={option.id}
                      onClick={() => setSelectedReason(option.id)}
                      className={`
                        w-full text-left p-4 rounded-xl border-2
                        transition-all duration-300
                        ${isSelected
                          ? `${colors.border} bg-blue-500/10 border-blue-500`
                          : `${colors.border} ${colors.bg.secondary} hover:${colors.bg.hover}`
                        }
                      `}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`
                          p-2 rounded-lg
                          ${isSelected ? 'bg-blue-500/20' : colors.bg.primary}
                        `}>
                          <Icon className={`
                            w-5 h-5
                            ${isSelected ? 'text-blue-500' : colors.text.secondary}
                          `} />
                        </div>
                        <div className="flex-1">
                          <div className={`font-medium ${colors.text.primary} mb-1`}>
                            {option.label}
                          </div>
                          <div className={`text-xs ${colors.text.muted}`}>
                            {option.description}
                          </div>
                        </div>
                        {isSelected && (
                          <div className="flex-shrink-0">
                            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Additional Information */}
              <div>
                <label className={`block text-sm font-medium ${colors.text.secondary} mb-2`}>
                  Additional information (optional)
                </label>
                <textarea
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  placeholder="Provide any additional details that might help us address this issue..."
                  rows={3}
                  className={`
                    w-full ${colors.bg.input} border ${colors.border}
                    rounded-lg p-3 text-sm ${colors.text.primary}
                    resize-none transition-colors duration-300
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                  `}
                />
              </div>
            </div>

            {/* Footer */}
            <div className={`flex gap-3 p-6 border-t ${colors.border}`}>
              <button
                onClick={() => setIsOpen(false)}
                className={`
                  flex-1 px-4 py-3 rounded-xl font-medium
                  ${colors.bg.secondary} ${colors.text.primary}
                  hover:opacity-80 transition-all duration-300
                `}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!selectedReason || isSubmitting}
                className={`
                  flex-1 px-4 py-3 rounded-xl font-medium
                  transition-all duration-300
                  ${selectedReason && !isSubmitting
                    ? `${colors.button.primary} hover:scale-[1.02] shadow-lg`
                    : `${colors.bg.secondary} ${colors.text.muted} cursor-not-allowed opacity-50`
                  }
                `}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </div>
                ) : (
                  'Submit Report'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
