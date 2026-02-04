import { useState, useEffect } from 'react';
import Header from "../components/Header";
import Footer from "../components/Footer";
import ReactMarkdown from 'react-markdown';
import { useLanguage } from '../i18n/useLanguage';

const TermsOfService = () => {
	const { language } = useLanguage();
	const [content, setContent] = useState('');

	useEffect(() => {
		fetch(`/src/assets/legal/terms-${language}.md`)
			.then(res => res.text())
			.then(text => setContent(text))
			.catch(() => {
				// Fallback to English if language file not found
				fetch('/src/assets/legal/terms-en.md')
					.then(res => res.text())
					.then(text => setContent(text));
			});
	}, [language]);

	return (
		<div className="min-h-screen bg-neutral-700 text-white flex flex-col">
			<Header titleKey="termsOfService"/>
				<main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
					<div className="columns-1 lg:columns-2 gap-8 prose prose-invert prose-headings:text-white prose-p:text-gray-300 prose-strong:text-white prose-li:text-gray-300 max-w-none">
					<ReactMarkdown>{content}</ReactMarkdown>
				</div>
			</main>
			<Footer showTOS={false}/>
		</div>
	)
}

export default TermsOfService;