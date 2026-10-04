export function Button() {
  return (
    <div>
      <button class="px-4 py-2 bg-blue-500 text-white rounded">Submit</button>
      <a class="hover:underline text-sm font-bold" href="/link">Link</a>
      <span class="flex items-center justify-between gap-4">Label</span>
      <p class="mt-2 mb-2 text-gray-500 leading-relaxed">Description</p>
      <input class="border border-gray-300 rounded-md focus:outline-none" />
    </div>
  );
}
