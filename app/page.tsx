import { CreateRoom } from '@/components/room/CreateRoom';
import { JoinRoom } from '@/components/room/JoinRoom';

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <h1 className="text-4xl font-bold text-center mb-8">Spyfall Online - Thai Edition</h1>
        <p className="text-center text-gray-600 mb-12">เกมหาสายลับออนไลน์สำหรับ 4-10 คน</p>

        <div className="grid md:grid-cols-2 gap-6">
          <CreateRoom />
          <JoinRoom />
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
