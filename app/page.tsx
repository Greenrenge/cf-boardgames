import { CreateRoom } from '@/components/room/CreateRoom';
import { JoinRoom } from '@/components/room/JoinRoom';
import Image from 'next/image';

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-4xl w-full">
        {/* Header with Logo */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative w-24 h-24 md:w-32 md:h-32 animate-fade-in">
              <Image
                src="/icon-no-bg.png"
                alt="Spyfall Online Logo"
                fill
                className="object-contain drop-shadow-xl"
                priority
              />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-4 animate-fade-in">
            Spyfall Online
          </h1>
          <p className="text-lg md:text-xl text-blue-900 font-medium mb-2">Thai Edition</p>
          <p className="text-gray-600 text-base md:text-lg">เกมหาสายลับออนไลน์สำหรับ 4-20 คน 🕵️‍♂️</p>
        </div>

        {/* Game Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <CreateRoom />
          <JoinRoom />
        </div>

        {/* How to Play Section */}
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-blue-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xl">📖</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800">วิธีเล่น</h3>
          </div>
          <ul className="space-y-4 text-gray-700">
            <li className="flex items-start gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors">
              <span className="text-2xl flex-shrink-0">🎭</span>
              <span>ผู้เล่น 1-4 คนเป็นสายลับ คนอื่นๆ จะได้รับข้อมูลสถานที่</span>
            </li>
            <li className="flex items-start gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors">
              <span className="text-2xl flex-shrink-0">💬</span>
              <span>ถามตอบกันเพื่อหาว่าใครเป็นสายลับ</span>
            </li>
            <li className="flex items-start gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors">
              <span className="text-2xl flex-shrink-0">🗳️</span>
              <span>ลงคะแนนเสียงหาสายลับก่อนเวลาหมด</span>
            </li>
            <li className="flex items-start gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors">
              <span className="text-2xl flex-shrink-0">🎯</span>
              <span>ถ้าสายลับรอด สายลับสามารถทายสถานที่เพื่อชนะได้</span>
            </li>
          </ul>
        </div>

        {/* Features Section */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl text-center border border-blue-100 hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-2">👥</div>
            <div className="text-sm font-semibold text-gray-800">4-20 ผู้เล่น</div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl text-center border border-blue-100 hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-2">🖼️</div>
            <div className="text-sm font-semibold text-gray-800">รูปภาพสถานที่</div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl text-center border border-blue-100 hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-2">🕵️</div>
            <div className="text-sm font-semibold text-gray-800">1-4 สายลับ</div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl text-center border border-blue-100 hover:shadow-lg transition-shadow">
            <div className="text-3xl mb-2">⚡</div>
            <div className="text-sm font-semibold text-gray-800">เล่นแบบเรียลไทม์</div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Made with ❤️ for Thai gamers</p>
        </div>
      </div>
    </main>
  );
}
