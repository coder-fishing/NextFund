export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">About MyApp</h1>
      <p className="text-gray-600 mb-4">
        MyApp is a crowdfunding platform that combines login via Google/Facebook 
        and a crypto wallet.
      </p>
      <p className="text-gray-600 mb-4">
        This page is simply an introduction. You can expand it with sections like
        vision, mission, development team, etc.
      </p>
      <p className="text-gray-600">
        The new header allows you to quickly navigate between the home page, campaign list, and management dashboard.
      </p>
    </div>
  );
}
