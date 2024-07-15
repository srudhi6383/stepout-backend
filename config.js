function generateBookingID() {
    return Math.floor(Math.random() * 9000000000) + 1000000000;
  }
  
  const now = new Date();
  
  const time = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const date = new Intl.DateTimeFormat("en-US", { dateStyle: "full" }).format(
    now
  );
  
  const finalTime = time + " , " + date;
  
  module.exports = { generateBookingID, time, date, finalTime };