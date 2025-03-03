export const getMonthDays = (month, year) => {
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);
    const days = [];
    const firstDayOfMonth = monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1; // Ajuster pour lundi (0) à dimanche (6)
    const totalDays = monthEnd.getDate();
  
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
  
    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(year, month, d);
      days.push({
        date,
        day: d,
        weekDay: ['Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.', 'Dim.'][date.getDay() === 0 ? 6 : date.getDay() - 1],
        month: String(date.getMonth() + 1).padStart(2, '0'),
      });
    }
  
    while (days.length % 7 !== 0) {
      days.push(null);
    }
  
    return days;
  };
  
  export const getCategoryFromName = (name) => {
    if (name.includes('(matin)')) return 'matin';
    if (name.includes('(soir)')) return 'soir';
    return 'habitude';
  };