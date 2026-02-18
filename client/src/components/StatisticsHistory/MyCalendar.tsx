import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css'

type MyCalendarProps = {
    value: Date;
    onChange: (d: Date) => void;
    locale?: string;
};

const MyCalendar = ({ value, onChange, locale }: MyCalendarProps) => {
    return (
        <div>
            <Calendar
                onChange={(v) => onChange(v as Date)}
                value={value}
                className="text-black bg-neutral-600 rounded-lg shadow-lg border-0"
                tileClassName="hover:bg-neutral-200 rounded-lg"
                locale={locale}
                maxDate={new Date()}
            />
        </div>
    );
};

export default MyCalendar;
