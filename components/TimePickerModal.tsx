import { useState, useRef, useEffect } from 'react';

interface TimePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (time: string) => void;
  initialValue?: string;
  title?: string;
}

const TimePickerModal: React.FC<TimePickerModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialValue = '09:00',
  title = 'Select Time',
}) => {
  const parseInitialTime = (time: string) => {
    const parts = time.split(':').map(Number);
    const hours24 = parts[0] ?? 9;
    const minutes = parts[1] ?? 0;
    const period = hours24 >= 12 ? 'PM' : 'AM';
    const hours12 = hours24 === 0 ? 12 : hours24 > 12 ? hours24 - 12 : hours24;
    return { hours: hours12, minutes, period };
  };

  const initial = parseInitialTime(initialValue);
  const [selectedHour, setSelectedHour] = useState(initial.hours);
  const [selectedMinute, setSelectedMinute] = useState(initial.minutes);
  const [selectedPeriod, setSelectedPeriod] = useState(initial.period);

  const hourRef = useRef<HTMLDivElement>(null);
  const minuteRef = useRef<HTMLDivElement>(null);
  const periodRef = useRef<HTMLDivElement>(null);

  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialScrollRef = useRef(false);

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);
  const periods = ['AM', 'PM'];

  useEffect(() => {
    if (isOpen) {
      isInitialScrollRef.current = true;
      // Scroll to selected values on open
      setTimeout(() => {
        scrollToIndex(hourRef, selectedHour - 1);
        scrollToIndex(minuteRef, selectedMinute);
        scrollToIndex(periodRef, selectedPeriod === 'AM' ? 0 : 1);
        setTimeout(() => {
          isInitialScrollRef.current = false;
        }, 100);
      }, 50);
    }
  }, [isOpen]);

  const scrollToIndex = (ref: React.RefObject<HTMLDivElement>, index: number) => {
    if (ref.current) {
      const itemHeight = 40;
      ref.current.scrollTop = index * itemHeight;
    }
  };

  const handleConfirm = () => {
    let hour24 = selectedHour;
    if (selectedPeriod === 'PM' && selectedHour !== 12) {
      hour24 = selectedHour + 12;
    } else if (selectedPeriod === 'AM' && selectedHour === 12) {
      hour24 = 0;
    }
    const timeString = `${hour24.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;
    onConfirm(timeString);
    onClose();
  };

  const handleScroll = (
    ref: React.RefObject<HTMLDivElement>,
    setter: (value: any) => void,
    values: any[]
  ) => {
    if (isInitialScrollRef.current) return;

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      if (ref.current) {
        const itemHeight = 40;
        const scrollTop = ref.current.scrollTop;
        const index = Math.round(scrollTop / itemHeight);
        const clampedIndex = Math.max(0, Math.min(index, values.length - 1));
        setter(values[clampedIndex]);
      }
    }, 150);
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9998,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onClick={onClose}
      >
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '1.5rem',
            width: '320px',
            maxWidth: '90vw',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
            position: 'relative',
            zIndex: 9999,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '1.5rem',
              textAlign: 'center',
            }}
          >
            {title}
          </div>

          {/* Time Picker Wheels */}
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: '1.5rem',
              position: 'relative',
            }}
          >
            {/* Selection highlight bar */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: 0,
                right: 0,
                height: '40px',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(239, 119, 34, 0.08)',
                borderTop: '1px solid rgba(239, 119, 34, 0.3)',
                borderBottom: '1px solid rgba(239, 119, 34, 0.3)',
                pointerEvents: 'none',
                zIndex: 1,
              }}
            />

            {/* Hours */}
            <div
              ref={hourRef}
              onScroll={() => handleScroll(hourRef, setSelectedHour, hours)}
              style={{
                height: '200px',
                overflowY: 'scroll',
                flex: 1,
                position: 'relative',
                zIndex: 2,
                WebkitOverflowScrolling: 'touch',
              }}
              className="time-scroll"
            >
              <div style={{ height: '80px' }} />
              {hours.map((hour) => (
                <div
                  key={hour}
                  onClick={() => {
                    setSelectedHour(hour);
                    isInitialScrollRef.current = true;
                    scrollToIndex(hourRef, hour - 1);
                    setTimeout(() => {
                      isInitialScrollRef.current = false;
                    }, 100);
                  }}
                  style={{
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: selectedHour === hour ? '20px' : '16px',
                    fontWeight: selectedHour === hour ? '600' : '400',
                    color: selectedHour === hour ? '#EF7722' : '#6b7280',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {hour.toString().padStart(2, '0')}
                </div>
              ))}
              <div style={{ height: '80px' }} />
            </div>

            {/* Separator */}
            <div
              style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#EF7722',
                zIndex: 2,
              }}
            >
              :
            </div>

            {/* Minutes */}
            <div
              ref={minuteRef}
              onScroll={() => handleScroll(minuteRef, setSelectedMinute, minutes)}
              style={{
                height: '200px',
                overflowY: 'scroll',
                flex: 1,
                position: 'relative',
                zIndex: 2,
                WebkitOverflowScrolling: 'touch',
              }}
              className="time-scroll"
            >
              <div style={{ height: '80px' }} />
              {minutes.map((minute) => (
                <div
                  key={minute}
                  onClick={() => {
                    setSelectedMinute(minute);
                    isInitialScrollRef.current = true;
                    scrollToIndex(minuteRef, minute);
                    setTimeout(() => {
                      isInitialScrollRef.current = false;
                    }, 100);
                  }}
                  style={{
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: selectedMinute === minute ? '20px' : '16px',
                    fontWeight: selectedMinute === minute ? '600' : '400',
                    color: selectedMinute === minute ? '#EF7722' : '#6b7280',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {minute.toString().padStart(2, '0')}
                </div>
              ))}
              <div style={{ height: '80px' }} />
            </div>

            {/* Period (AM/PM) */}
            <div
              ref={periodRef}
              onScroll={() => handleScroll(periodRef, setSelectedPeriod, periods)}
              style={{
                height: '200px',
                overflowY: 'scroll',
                flex: 0.8,
                position: 'relative',
                zIndex: 2,
                WebkitOverflowScrolling: 'touch',
              }}
              className="time-scroll"
            >
              <div style={{ height: '80px' }} />
              {periods.map((period) => (
                <div
                  key={period}
                  onClick={() => {
                    setSelectedPeriod(period);
                    isInitialScrollRef.current = true;
                    scrollToIndex(periodRef, period === 'AM' ? 0 : 1);
                    setTimeout(() => {
                      isInitialScrollRef.current = false;
                    }, 100);
                  }}
                  style={{
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: selectedPeriod === period ? '18px' : '14px',
                    fontWeight: selectedPeriod === period ? '600' : '400',
                    color: selectedPeriod === period ? '#EF7722' : '#6b7280',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {period}
                </div>
              ))}
              <div style={{ height: '80px' }} />
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: 'white',
                color: '#6b7280',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f9fafb';
                e.currentTarget.style.borderColor = '#d1d5db';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.borderColor = '#e5e7eb';
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              style={{
                flex: 1,
                padding: '0.75rem',
                background: 'linear-gradient(135deg, #EF7722 0%, #ff8833 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(239, 119, 34, 0.25)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 119, 34, 0.35)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(239, 119, 34, 0.25)';
              }}
            >
              OK
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .time-scroll::-webkit-scrollbar {
          width: 0px;
          background: transparent;
        }
        .time-scroll {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
};

export default TimePickerModal;
