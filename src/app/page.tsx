export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          AssetChain
        </h1>
        <p className="mt-4 text-lg text-slate-400">
          Nền tảng Đăng ký & Quản lý Quyền Sở hữu Tài sản Số trên Blockchain EVM
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <span className="rounded-full bg-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
            Khởi tạo Ngày 1 thành công
          </span>
        </div>
      </div>
    </main>
  );
}

