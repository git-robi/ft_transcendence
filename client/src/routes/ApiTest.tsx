import Header from "../components/Header";
import Footer from "../components/Footer";
import Button from "../components/Button";
import { useLanguage } from "../i18n/useLanguage";

const ApiTest = () => {
    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col">
            <Header />
            <Footer />
        </div>
    )
}

export default ApiTest;