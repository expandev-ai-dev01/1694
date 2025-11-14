/**
 * @page HomePage
 * @summary Main home page displaying weather information.
 * @domain weather
 * @type dashboard-page
 * @category public
 */
export const HomePage = () => {
  return (
    <div className="home-page">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">WeatherNow</h1>
        <p className="text-lg text-gray-600">Weather information at your fingertips</p>
      </div>
    </div>
  );
};

export default HomePage;
