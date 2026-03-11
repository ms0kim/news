export function Header() {
    const currentDate = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  
    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) return "Good Morning";
      if (hour < 18) return "Good Afternoon";
      return "Good Evening";
    };
  
    return (
      <div className="bg-gradient-to-r from-[#8B7FD8] via-[#C4B5FD] to-[#FFB6C1] p-6 pb-8">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-white/80 text-sm">{currentDate}</div>
              <h1 className="text-white text-2xl mt-1">{getGreeting()}! 👋</h1>
            </div>
            <div className="text-5xl">🐻</div>
          </div>
          <p className="text-white/90 text-sm mt-2">
            Let's grow your wealth together today
          </p>
        </div>
      </div>
    );
  }
  