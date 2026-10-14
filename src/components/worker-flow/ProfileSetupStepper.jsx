import { useState, useEffect } from "react";
import { Check, Calendar as CalendarIcon } from "lucide-react";

const STEPS = [
  {
    id: 1,
    title: "Personal Details",
    key: "personalDetails",
    fields: [
      {
        key: "fullName",
        label: "Full Name",
        type: "text",
        placeholder: "Enter your full name",
        required: true,
        pattern: "^[a-zA-Z\\s]{2,50}$",
      },
      {
        key: "phoneNumber",
        label: "Phone Number",
        type: "tel",
        placeholder: "+91 9876543210",
        required: true,
        pattern: "^[+]?[0-9]{10,13}$",
      },
      {
        key: "email",
        label: "Email",
        type: "email",
        placeholder: "john@example.com",
        required: true,
      },
      // { key: "dateOfBirth", label: "Date of Birth", type: "date", required: true },
      {
        key: "address",
        label: "Address",
        type: "textarea",
        placeholder: "Enter your complete address",
        required: true,
      },
    ],
  },
  {
    id: 2,
    title: "Services Selection",
    key: "services",
    fields: [
      {
        key: "services",
        label: "Select Services",
        type: "checkbox",
        options: [
          "Cleaning",
          "Plumbing",
          "Electrical",
          "Carpentry",
          "Painting",
        ],
        required: true,
      },
    ],
  },

  {
    id: 4,
    title: "KYC Verification",
    key: "kyc",
    fields: [
      {
        key: "aadhaarNumber",
        label: "Aadhaar Number",
        type: "text",
        placeholder: "XXXX XXXX XXXX",
        required: true,
        pattern: "^[0-9]{4}\\s[0-9]{4}\\s[0-9]{4}$",
      },
      {
        key: "panNumber",
        label: "PAN Number",
        type: "text",
        placeholder: "ABCDE1234F",
        required: true,
        pattern: "^[A-Z]{5}[0-9]{4}[A-Z]{1}$",
      },
      {
        key: "documents",
        label: "Upload Documents",
        type: "file",
        placeholder: "Upload Aadhaar & PAN",
        required: true,
      },
    ],
  },
  {
    id: 5,
    title: "Payment Setup",
    key: "payment",
    fields: [
      {
        key: "bankAccountNumber",
        label: "Bank Account Number",
        type: "text",
        placeholder: "1234567890",
        required: true,
        pattern: "^[0-9]{9,18}$",
      },
      {
        key: "ifscCode",
        label: "IFSC Code",
        type: "text",
        placeholder: "BANK0001234",
        required: true,
        pattern: "^[A-Z]{4}0[A-Z0-9]{6}$",
      },
      {
        key: "accountHolderName",
        label: "Account Holder Name",
        type: "text",
        placeholder: "John Doe",
        required: true,
      },
    ],
  },
];

const STORAGE_KEY = "worker_profile_data";

export default function ProfileSetupStepper({ isEditMode = false, onSave }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(() => {
    if (isEditMode) {
      // In edit mode, mark all steps as completed
      return STEPS.map((_, index) => index);
    }
    return [];
  });
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  });
  const [errors, setErrors] = useState({});
  const [selectedDates, setSelectedDates] = useState(
    () => formData.availability || [],
  );

  // Save to localStorage whenever formData changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  // Save selected dates
  useEffect(() => {
    setFormData((prev) => ({ ...prev, availability: selectedDates }));
  }, [selectedDates]);

  const validateStep = (stepIndex) => {
    if (isEditMode) {
      setErrors({});
      return true;
    }
    const step = STEPS[stepIndex];
    const stepErrors = {};

    step.fields.forEach((field) => {
      if (field.required) {
        const value = formData[field.key];

        if (field.type === "checkbox") {
          if (!value || (Array.isArray(value) && value.length === 0)) {
            stepErrors[field.key] = `${field.label} is required`;
          }
        } else if (field.type === "calendar") {
          if (!selectedDates || selectedDates.length === 0) {
            stepErrors[field.key] = "Please select at least one available date";
          }
        } else if (field.type === "file") {
          if (!value) {
            stepErrors[field.key] = `${field.label} is required`;
          }
        } else {
          if (!value || value.trim() === "") {
            stepErrors[field.key] = `${field.label} is required`;
          } else if (field.pattern && !new RegExp(field.pattern).test(value)) {
            stepErrors[field.key] = `Invalid ${field.label.toLowerCase()}`;
          } else if (field.type === "number") {
            const num = parseInt(value);
            if (
              isNaN(num) ||
              (field.min !== undefined && num < field.min) ||
              (field.max !== undefined && num > field.max)
            ) {
              stepErrors[field.key] =
                `Please enter a valid number${field.min !== undefined ? ` between ${field.min} and ${field.max}` : ""}`;
            }
          }
        }
      }
    });

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleInputChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    // Clear error when user starts typing
    if (errors[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const handleCheckboxChange = (key, value, checked) => {
    setFormData((prev) => {
      const current = prev[key] || [];
      if (checked) {
        return { ...prev, [key]: [...current, value] };
      } else {
        return { ...prev, [key]: current.filter((item) => item !== value) };
      }
    });
    if (errors[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const handleFileChange = (key, files) => {
    if (files && files.length > 0) {
      const fileNames = Array.from(files).map((file) => file.name);
      setFormData((prev) => ({ ...prev, [key]: fileNames }));
    }
    if (errors[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const handleDateSelect = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    setSelectedDates((prev) => {
      if (prev.includes(dateStr)) {
        return prev.filter((d) => d !== dateStr);
      } else {
        return [...prev, dateStr].sort();
      }
    });
    if (errors.availability) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.availability;
        return newErrors;
      });
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      if (currentStep < STEPS.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        // Profile completed - mark as completed
        localStorage.setItem("worker_profile_completed", "true");
        // Trigger custom event to notify parent
        window.dispatchEvent(new Event("profileCompleted"));

        // If in edit mode, call onSave callback
        if (isEditMode && onSave) {
          onSave();
        }
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepCompleted = (stepIndex) => completedSteps.includes(stepIndex);
  const isStepActive = (stepIndex) => stepIndex === currentStep;

  const currentStepData = STEPS[currentStep];
  const getFieldValue = (key) => formData[key] || "";

  // Calendar component
  const CalendarView = () => {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(currentYear, currentMonth, i));
    }

    const prevMonth = () => {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    };

    const nextMonth = () => {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    };

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded">
            ←
          </button>
          <h4 className="text-sm font-semibold text-gray-900">
            {monthNames[currentMonth]} {currentYear}
          </h4>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded">
            →
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day) => (
            <div
              key={day}
              className="text-xs font-medium text-gray-500 text-center py-2"
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, index) => {
            if (!date) {
              return <div key={index} className="h-8" />;
            }
            const dateStr = date.toISOString().split("T")[0];
            const isSelected = selectedDates.includes(dateStr);
            const isPast = date < new Date(today.setHours(0, 0, 0, 0));

            return (
              <button
                key={index}
                onClick={() => !isPast && handleDateSelect(date)}
                disabled={isPast}
                className={`h-8 text-xs rounded transition-colors ${
                  isSelected
                    ? "bg-[#3d8bff] text-white"
                    : isPast
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
        {selectedDates.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-600 mb-2">
              Selected dates ({selectedDates.length}):
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedDates.slice(0, 5).map((date) => (
                <span
                  key={date}
                  className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded"
                >
                  {new Date(date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              ))}
              {selectedDates.length > 5 && (
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                  +{selectedDates.length - 5} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Stepper Header - Only for form steps */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                    isStepCompleted(index)
                      ? "bg-[#3d8bff] text-white"
                      : isStepActive(index)
                        ? "bg-[#3d8bff] text-white"
                        : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {isStepCompleted(index) ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    step.id
                  )}
                </div>
                <span
                  className={`mt-1.5 text-xs font-medium text-center ${
                    isStepActive(index)
                      ? "text-[#3d8bff]"
                      : isStepCompleted(index)
                        ? "text-gray-600"
                        : "text-gray-400"
                  }`}
                >
                  {step.title}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 ${
                    isStepCompleted(index) ? "bg-[#3d8bff]" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          {currentStepData.title}
        </h3>

        <div className="space-y-5">
          {currentStepData.fields.map((field, index) => (
            <div key={index}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {field.type === "textarea" ? (
                <textarea
                  value={getFieldValue(field.key)}
                  onChange={(e) => handleInputChange(field.key, e.target.value)}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-[#3d8bff] focus:border-transparent ${
                    errors[field.key] ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder={field.placeholder}
                  rows="3"
                />
              ) : field.type === "checkbox" ? (
                <div className="space-y-2">
                  {field.options.map((option) => {
                    const isChecked =
                      Array.isArray(getFieldValue(field.key)) &&
                      getFieldValue(field.key).includes(option);
                    return (
                      <label
                        key={option}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) =>
                            handleCheckboxChange(
                              field.key,
                              option,
                              e.target.checked,
                            )
                          }
                          className="w-4 h-4 text-[#3d8bff] border-gray-300 rounded focus:ring-[#3d8bff]"
                        />
                        <span className="text-sm text-gray-700">{option}</span>
                      </label>
                    );
                  })}
                </div>
              ) : field.type === "calendar" ? (
                <CalendarView />
              ) : field.type === "file" ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    multiple
                    onChange={(e) =>
                      handleFileChange(field.key, e.target.files)
                    }
                    className="hidden"
                    id={`file-${field.key}`}
                  />
                  <label
                    htmlFor={`file-${field.key}`}
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <CalendarIcon className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600 mb-1">
                      {field.placeholder}
                    </span>
                    <span className="text-xs text-gray-500">
                      Click to upload
                    </span>
                  </label>
                  {getFieldValue(field.key) && (
                    <div className="mt-2 text-xs text-gray-600">
                      Selected:{" "}
                      {Array.isArray(getFieldValue(field.key))
                        ? getFieldValue(field.key).join(", ")
                        : getFieldValue(field.key)}
                    </div>
                  )}
                </div>
              ) : (
                <input
                  type={field.type}
                  value={getFieldValue(field.key)}
                  onChange={(e) => handleInputChange(field.key, e.target.value)}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-[#3d8bff] focus:border-transparent ${
                    errors[field.key] ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder={field.placeholder}
                  min={field.min}
                  max={field.max}
                />
              )}
              {errors[field.key] && (
                <p className="mt-1 text-xs text-red-600">{errors[field.key]}</p>
              )}
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className={`px-5 py-2 text-sm rounded-lg font-medium transition-colors ${
              currentStep === 0
                ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            className="px-5 py-2 text-sm bg-[#3d8bff] text-white rounded-lg font-medium hover:bg-[#4060EE] transition-colors"
          >
            {currentStep === STEPS.length - 1
              ? isEditMode
                ? "Save Changes"
                : "Complete Setup"
              : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
