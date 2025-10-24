export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <h1 className="text-4xl font-bold text-center mb-8">Spyfall Online - Thai Edition</h1>
        <p className="text-center text-gray-600 mb-12">เกมหาสายลับออนไลน์สำหรับ 4-10 คน</p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">สร้างห้อง</h2>
            <p className="text-gray-600 mb-4">สร้างห้องใหม่และเชิญเพื่อนมาเล่น</p>
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
              สร้างห้องใหม่
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">เข้าร่วมห้อง</h2>
            <p className="text-gray-600 mb-4">ใส่รหัสห้องเพื่อเข้าร่วมเกม</p>
            <button className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700">
              เข้าร่วมห้อง
            </button>
          </div>
        </div>

        <div className="mt-12 bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-3">วิธีเล่น</h3>
          <ul className="space-y-2 text-gray-700">
            <li>• ผู้เล่น 1 คนเป็นสายลับ คนอื่นๆ จะได้รับข้อมูลสถานที่</li>
            <li>• ถามตอบกันเพื่อหาว่าใครเป็นสายลับ</li>
            <li>• ลงคะแนนเสียงหาสายลับก่อนเวลาหมด</li>
            <li>• ถ้าสายลับรอด สายลับสามารถทายสถานที่เพื่อชนะได้</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
