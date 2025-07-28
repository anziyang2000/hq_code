import { useState, forwardRef, useImperativeHandle } from 'react';
import { DatetimePicker, Field, Popup, Button } from 'react-vant';
import { CalendarO } from '@react-vant/icons';

interface DateRangePickerProps {
  onChange?: (dates: [string | null, string | null]) => void;
}

const DateRangePickerComponent = forwardRef((props: DateRangePickerProps, ref) => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(new Date());
  const [isStartPicking, setIsStartPicking] = useState(true);
  const [startInputColor, setStartInputColor] = useState('rgba(204, 204, 204, 1)');
  const [endInputColor, setEndInputColor] = useState('rgba(204, 204, 204, 1)');

  const formatDate = (date: Date | null): string | null => {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const handleConfirm = () => {
    if (isStartPicking) {
      setStartDate(tempDate);
      if (endDate && tempDate > endDate) setEndDate(null);
    } else {
      setEndDate(tempDate);
    }
    setShowPicker(false);

    if (props.onChange) {
      props.onChange([formatDate(startDate), formatDate(endDate)]);
    }
  };

  useImperativeHandle(ref, () => ({
    resetDate() {
      setStartDate(null);
      setEndDate(null);
      setTempDate(new Date());
      props.onChange?.([null, null]);
      setStartInputColor('rgba(204, 204, 204, 1)');
      setEndInputColor('rgba(204, 204, 204, 1)');
    }
  }));

  const dateFormatter = (type: string, value: string) => {
    if (type === 'year') {
      return `${value}年`;
    } else if (type === 'month') {
      return `${value}月`;
    } else if (type === 'day') {
      return `${value}日`;
    }
    return value;
  };

  const handleInputFocus = (isStart: boolean) => {
    if (isStart) {
      setStartInputColor('rgba(22, 119, 255, 1)');
    } else {
      setEndInputColor('rgba(22, 119, 255, 1)');
    }
  };

  const handleInputBlur = (isStart: boolean) => {
    if (isStart) {
      if (!startDate) {
        setStartInputColor('rgba(204, 204, 204, 1)');
      } else {
        setStartInputColor('rgba(22, 119, 255, 1)');
      }
    } else {
      if (!endDate) {
        setEndInputColor('rgba(204, 204, 204, 1)');
      } else {
        setEndInputColor('rgba(22, 119, 255, 1)');
      }
    }
  };

  const handleShowPicker = () => {
    setShowPicker(true);
    setStartInputColor(startDate ? 'rgba(22, 119, 255, 1)' : 'rgba(204, 204, 204, 1)');
    setEndInputColor(endDate ? 'rgba(22, 119, 255, 1)' : 'rgba(204, 204, 204, 1)');
  };

  return (
    <div>
      <Field
        className='list_time'
        label="订单时间"
        value={
          startDate || endDate
            ? `${startDate ? startDate.toLocaleDateString() : '请选择开始日期'} - ${endDate ? endDate.toLocaleDateString() : '请选择结束日期'}`
            : '请选择时间段>'
        }
        onClick={handleShowPicker}
        readOnly
        clickable
        placeholder="请选择时间段>"
        style={{ color: startInputColor || endInputColor }}
      />

      <Popup
        visible={showPicker}
        onClose={() => setShowPicker(false)}
        position="bottom"
        round
      >
        <div>
          <div className='popupTop' style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button plain onClick={() => setShowPicker(false)}>取消</Button>
            <span className='popupTitle' style={{ alignSelf: 'center' }}>选择时间</span>
            <Button plain onClick={handleConfirm}>确认</Button>
          </div>

          <div className='popupSelect' style={{ display: 'flex', alignItems: 'center' }}>
            <Field
              value={startDate ? startDate.toLocaleDateString() : ''}
              onClick={() => {
                setIsStartPicking(true);
                setTempDate(startDate || new Date());
                setStartInputColor('rgba(22, 119, 255, 1)');
              }}
              readOnly
              clickable
              placeholder="开始日期"
              style={{ flex: 1, position: 'relative', borderColor: startInputColor, color: startInputColor }}
              rightIcon={<CalendarO style={{ color: startInputColor }} />}
              onFocus={() => handleInputFocus(true)}
              onBlur={() => handleInputBlur(true)}
            />

            <span className='popupLine'>——</span>

            <Field
              value={endDate ? endDate.toLocaleDateString() : ''}
              onClick={() => {
                setIsStartPicking(false);
                setTempDate(endDate || new Date());
                setEndInputColor('rgba(22, 119, 255, 1)');
              }}
              readOnly
              clickable
              placeholder="结束日期"
              style={{ flex: 1, position: 'relative', borderColor: endInputColor, color: endInputColor }}
              rightIcon={<CalendarO style={{ color: endInputColor }} />}
              onFocus={() => handleInputFocus(false)}
              onBlur={() => handleInputBlur(false)}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <DatetimePicker
              type="date"
              value={tempDate}
              formatter={dateFormatter}
              onChange={(date: Date) => {
                setTempDate(date);
                if (isStartPicking) {
                  // 选择开始日期时，确保选择的日期在结束日期之前
                  if (!endDate || date <= endDate) {
                    setStartDate(date);
                    setStartInputColor('rgba(22, 119, 255, 1)');
                  } else {
                    // 如果选择的开始日期晚于结束日期，则清除结束日期
                    setEndDate(null);
                  }
                } else {
                  // 选择结束日期时，确保选择的日期在开始日期之后
                  if (!startDate || date >= startDate) {
                    setEndDate(date);
                    setEndInputColor('rgba(22, 119, 255, 1)');
                  } else {
                    // 如果选择的结束日期早于开始日期，则清除开始日期
                    setStartDate(null);
                  }
                }
                if (props.onChange) {
                  props.onChange([formatDate(startDate), formatDate(endDate)]);
                }
              }}
            />
            <style>
              {`
                .rv-picker__confirm,
                .rv-picker__cancel {
                  display: none !important;
                }
              `}
            </style>
          </div>
        </div>
      </Popup>
    </div>
  );
});

export default DateRangePickerComponent;
