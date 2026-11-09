using System;
using System.Windows.Forms;

namespace ShiftScheduleApp
{
    static class Program
    {
        /// <summary>
        /// Главная точка входа для приложения Windows Desktop (БЕЗ Node.js).
        /// Запускается напрямую в Visual Studio по клавише F5.
        /// </summary>
        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new MainForm());
        }
    }
}
