import { useState } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css'
import { useLanguage } from "../../i18n/useLanguage";

type MyCalendarProps = {
    locale: string;
};

const MyCalendar = ({ locale }: MyCalendarProps) => {
    const [date, setDate] = useState<Date>(new Date());
  

    return (
        <div>
            <Calendar 
             onChange={(value) => setDate(value as Date)}
             value={date}
             className="text-black bg-neutral-600 rounded-lg shadow-lg border-0"
             tileClassName="hover:bg-neutral-600 rounded-lg"
             locale={locale}
             maxDate={new Date()}
            />
        </div>
    )
}

export default MyCalendar;