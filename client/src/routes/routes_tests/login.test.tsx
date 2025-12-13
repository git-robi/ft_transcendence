import Button from "../../components/Button.test";

function login() {
  return (
    <div className="h-screen flex items-center justify-center">

      <form className="bg-white p-6 rounded shadow-md" > {/*add on submit logic*/}
        <h2 className="text-xl font-bold mb-4 flex justify-center">Login</h2>
        <input type="text" placeholder="Username" className="border p-2 mb-2 w-full" />
        <input type="password" placeholder="Password" className="border p-2 mb-2 w-full" />
        <div className="flex justify-end">
        <Button text="Login" type="submit" />
        </div>
      </form>

    </div>
  )
}

export default login