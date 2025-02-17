const http = require('http');

const url = require('url');

const MyApiKey = process.env.myApiKey;

// Создаю http server
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);

  // Главная страница с формой
  if (parsedUrl.pathname === "/") {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <h1>Узнай погоду</h1>
      <form action="/weather" method="GET">
        <input type="text" name="city" placeholder="Введите город" required>
        <button type="submit">Узнать погоду</button>
      </form>
    `);
  }

  // Обработка запроса погоды
  else if (parsedUrl.pathname === "/weather") {
    const city = parsedUrl.query.city;

    if (!city) {
      res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<h1 style="color:red">Ошибка: город не указан!</h1><a href="/">Назад</a>');
      return;
    }

    const apiUrl = `http://api.weatherstack.com/current?access_key=${MyApiKey}&query=${city}&units=m&lang=ru`;
    // Выполняем запрос к API
    http.get(apiUrl, (apiRes) => {
      let data = '';

      // Собираем данные от API
      apiRes.on('data', (chunk) => {
        data += chunk;
      });

      // Когда данные получены
      apiRes.on('end', () => {
        try {
          const weatherData = JSON.parse(data);

          // Проверяем, есть ли данные
          if (weatherData.success !== false) {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`
              <h1>Погода в ${weatherData.location.name}, ${weatherData.location.country}</h1>
              <p>Температура: ${weatherData.current.temperature}°C</p>
              <p>Ощущается как: ${weatherData.current.feelslike}°C</p>
              <p>Погода: ${weatherData.current.weather_descriptions[0]}</p>
              <p>Влажность: ${weatherData.current.humidity}%</p>
              <p>Скорость ветра: ${weatherData.current.wind_speed} км/ч</p>
              <a href="/">Назад</a>
            `);
          } else {
            res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`
              <h1>Ошибка: ${weatherData.error.info}</h1>
              <a href="/">Назад</a>
            `);
          }
        } catch (error) {
          res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(`
            <h1>Ошибка сервера</h1>
            <p>${error.message}</p>
            <a href="/">Назад</a>
          `);
        }
      });
    }).on('error', (error) => {
      res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <h1>Ошибка при запросе к API</h1>
        <p>${error.message}</p>
        <a href="/">Назад</a>
      `);
    });
  }

  // Обработка неизвестных маршрутов
  else {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>Страница не найдена</h1><a href="/">Назад</a>');
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});