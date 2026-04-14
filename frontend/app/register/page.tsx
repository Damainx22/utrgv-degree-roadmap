export default function Register() {
  return (
      <div className="min-h-screen bg-orange-500 flex flex-col items-center justify-center">      <h1 className="text-3xl font-bold mb-6">Create Account</h1>

      <form className="flex flex-col gap-4 w-80">
        <input
          type="text"
          placeholder="Name"
          className="border p-2 rounded bg-white"
        />

        <input
          type="email"
          placeholder="Email"
          className="border p-2 rounded bg-white"
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-2 rounded bg-white"
        />

        <button className="bg-green-500 text-white p-2 rounded">
          Register
        </button>
      </form>
    </div>
  );
}