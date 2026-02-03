import Header from "../components/Header";
import Footer from "../components/Footer";
import ChatBox from "../components/Chat/ChatBox"
const Chat = () => {
    return (
        <div className='min-h-screen bg-neutral-700 text-white flex flex-col'>
            <Header titleKey='chat'/>
            <div className="flex lg:justify-center flex-1">
              <div className=" w-full lg:w-200 ">
                <ChatBox />
              </div>
            </div>
            <Footer />
        </div>
    )
}

export default Chat;