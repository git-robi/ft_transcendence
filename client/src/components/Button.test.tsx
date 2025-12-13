

type Props = {
  text: string;
  onClick?: () => void;
  type?: 'submit' | 'button';
}

function Button({text, onClick, type = 'button'}: Props) {
  return (
    <div>
        <button type={type} className="px-4 py-2 bg-white-500 text-black border-2 border-black-500 rounded" onClick={onClick}>{text}</button>
    </div>
  )
}

export default Button