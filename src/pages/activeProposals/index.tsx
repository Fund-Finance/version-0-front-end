
export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 p-6 mb-6">
      {/* Header */}
      <header className="flex items-center justify-between border-b mb-6 py-1">
        <div className="text-xl font-bold">Logo</div>
        <h1 className="text-2xl font-semibold text-center flex-grow">Active Proposals</h1>
        <div className="w-[60px]">{/* empty space for alignment */}</div>
      </header>

      {/* Table Header */}
      <div className="grid grid-cols-5 bg-white shadow rounded-t-md px-4 py-3 font-semibold text-gray-700">
        <div>Proposal ID</div>
        <div>User</div>
        <div>XX ETH → YY BTC</div>
        <div>XX COMP → YY UNI</div>
        <div>Actions</div>
      </div>

      {/* Table Rows (mocked entries with circles) */}
      <div className="bg-white shadow rounded-b-md divide-y">
        {Array.from({ length: 10 }).map((_, index) => (
          <div
            key={index}
            className="grid grid-cols-5 px-4 py-4 items-center text-gray-600"
          >
            <div>#{index + 1}</div>
            <div>user{index + 1}.eth</div>
            <div>1.0 ETH → 0.03 BTC</div>
            <div>25 COMP → 40 UNI</div>
            <div>
              <span className="w-3 h-3 bg-black rounded-full inline-block"></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

