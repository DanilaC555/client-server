document.addEventListener('DOMContentLoaded', async () => {

  // работа с сервером
  // url сервера
  const SERVER_URL = 'http://localhost:3000'

  // добавления на сервер студента
  async function serverAddStudent(objStudent) {
    // обращение к серверу
    let response = await fetch(SERVER_URL + '/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(objStudent),
    });
    // хранение данных, которые вернёт сервер
    let data = await response.json();
    return data;
  }

  // получить данные с сервера
  async function serverGetStudent() {
    // обращение к серверу
    let response = await fetch(SERVER_URL + '/api/students', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    // хранение данных, которые вернёт сервер
    let data = await response.json();

    // Преобразуем дату рождения из строки в объект Date
      data.forEach(student => {
      student.birthday = new Date(student.birthday);
    });
    return data;
  }

  // удаление студента
  async function serverDeleteStudent(id) {
    // обращение к серверу
    let response = await fetch(SERVER_URL + `/api/students/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    // хранение данных, которые вернёт сервер
    let data = await response.json();
    return data;
  }

  // массив объектов студентов
  let studentsList = [];

  // получение данных с сервера и присваивание переменной studentsList
  let serverData = await serverGetStudent();
  // запрос на сервер был успешным и данные получены, тогда присваиваем значение
  if (serverData !== false) {
    studentsList = serverData;
  }

  // Флаг сортировки
  // изначально по возвростанию
  let sortDirection = {
    userFIO: true,
    faculty: true,
    dateBirth: true,
    yearCommencement: true,
  };

  // Добавление элементов таблицы
  const tbody = document.getElementById('students-table-body');

  // Добавление элементов формы
  const form = document.getElementById('student-form');
  const nameInput = document.getElementById('name');
  const surnameInput = document.getElementById('surname');
  const patronymicInput = document.getElementById('patronymic');
  const dateBirthInput = document.getElementById('date-birth');
  const yearCommencementInput = document.getElementById('year-commencement');
  const facultyInput = document.getElementById('faculty');

  // добавление элементов сортировки
  const sortFIO = document.getElementById('sort-fio');
  const sortFaculty = document.getElementById('sort-faculty');
  const sortBirthDay = document.getElementById('sort-age');
  const sortStartYear = document.getElementById('sort-start-year');

  // добавления элментов фильтрации
  const formFilter = document.getElementById('form-filter');
  const filterFIO = document.getElementById('filter-name');
  const filterFaculty = document.getElementById('filter-faculty');
  const filterStartYear = document.getElementById('filter-start-year');
  const filterEndYear = document.getElementById('filter-end-year');

  // создание ошибки и добавление его внизу
  const errorMessage = document.createElement('div');
  errorMessage.style.color = 'red';
  form.insertBefore(errorMessage, form.lastElementChild);

  // Создание tr для одного студента
  const createUserTr = (student) => {
    const userTr = document.createElement('tr');

    // Ф.И.О. студента
    const userFIO = document.createElement('td');
    userFIO.textContent = `${student.surname} ${student.name} ${student.lastname}`;

    // Факультет
    const facultyUser = document.createElement('td');
    facultyUser.textContent = student.faculty;

    // Дата рождения и возраст
    const birthDay = document.createElement('td');
    const age = calculateAge(student.birthday);
    birthDay.textContent = formatDate(student.birthday) + ` (${age} ${getAgeSuffix(age)})`;

    // Годы обучения и номер курса
    const yearCommencementUser = document.createElement('td');
    const currentYear = new Date().getFullYear();
    const course = getCourse(student.studyStart, currentYear);
    yearCommencementUser.textContent = `${student.studyStart}-${currentYear} (${course})`;

    // удаление объекта
    const tdDelite = document.createElement ('td');
    const buttonDelite = document.createElement('button');
    buttonDelite.classList.add('btn', 'btn-danger')
    buttonDelite.textContent = 'Удалить';
    tdDelite.append(buttonDelite);

    // событяи удаления студента
    tdDelite.addEventListener('click', async () =>{
    // вызов функции для удаления студента по его ID
     await serverDeleteStudent(student.id);
    //  удаления строки
     userTr.remove();
    });

    // добавленяи элементов
    userTr.append(userFIO, facultyUser, birthDay, yearCommencementUser, tdDelite);

    return userTr;
  };

  // Функция для расчета возраста по дате рождения
  const calculateAge = (birthday) => {
    const today = new Date();
    let age = today.getFullYear() - birthday.getFullYear();
    const monthDifference = today.getMonth() - birthday.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthday.getDate())) {
      age--;
    }
    return age;
  };

  // Функция для форматирования даты в формат "дд.мм.гггг"
  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  // Функция для получения суффикса для возраста (год, года, лет)
  const getAgeSuffix = (age) => {
    if (age % 10 === 1 && age !== 11) {
      return 'год';
    } else if (age % 10 >= 2 && age % 10 <= 4 && (age < 10 || age > 20)) {
      return 'года';
    } else {
      return 'лет';
    }
  };

// Функция для определения номера курса
const getCourse = (startYear, currentYear) => {
  const yearsInUniversity = currentYear - startYear + 1;
  if (yearsInUniversity > 4) {
    return 'закончил';
  } else {
    return `${yearsInUniversity} курс`;
  }
};

  // Функция для рендера списка студентов
  const renderStudentList = (arrayData) => {
    tbody.innerHTML = ''; // Очистить текущий список перед перерендером

    arrayData.forEach((student) => {
      const newTr = createUserTr(student);
      tbody.append(newTr);
    });
  };

  // Изначально рендерим список студентов
  renderStudentList(studentsList);

  // Функция для валидации данных
  const validateForm = () => {
    const errors = [];

    const firstName = nameInput.value.trim();
    const sureName = surnameInput.value.trim();
    const patronymic = patronymicInput.value.trim();
    const faculty = facultyInput.value.trim();
    const dateBirth = new Date(dateBirthInput.value);
    const yearCommencement = parseInt(yearCommencementInput.value.trim());

    if (!firstName) {
      errors.push('Имя не должно быть пустым.');
    }

    if (!sureName) {
      errors.push('Фамилия не должна быть пустой.');
    }

    if (!patronymic) {
      errors.push('Отчество не должно быть пустым.');
    }

    if (!faculty) {
      errors.push('Факультет не должен быть пустым.');
    }

    if (!(dateBirth instanceof Date) || isNaN(dateBirth)) {
      errors.push('Дата рождения не является корректной датой.');
    } else {
      const minDate = new Date('1900-01-01');
      const maxDate = new Date();
      if (dateBirth < minDate || dateBirth > maxDate) {
        errors.push('Дата рождения должна быть в диапазоне от 01.01.1900 до текущей даты.');
      }
    }

    if (isNaN(yearCommencement) || yearCommencement < 2000 || yearCommencement > new Date().getFullYear()) {
      errors.push('Год начала обучения должен быть в диапазоне от 2000-го до текущего года.');
    }

    return errors;
  };

  // Добавление нового студента
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const errors = validateForm();

    if (errors.length > 0) {
      errorMessage.innerHTML = errors.join('<br>');
    } else {
      errorMessage.innerHTML = '';

      // добавление новых студентов в таблицу
      const newStudentList = {
        name: nameInput.value.trim(),
        surname: surnameInput.value.trim(),
        lastname: patronymicInput.value.trim(),
        faculty: facultyInput.value.trim(),
        birthday: new Date(dateBirthInput.value),
        studyStart: parseInt(yearCommencementInput.value.trim()),
      }

      // отправка нового студента на сервер
     let serverObjData = await serverAddStudent(newStudentList);

      // добавление нового стуента в таблицу
      studentsList.push(serverObjData);

      // Обновляем таблицу после добавления нового студента
      renderStudentList(studentsList);

      // Очистка формы после добавления студента
      form.reset();
    }
  });

  // сортировка
  // Функция для сортировки
  const sortStudents = (keys, direction) => {
    studentsList.sort((a, b) => {
      for (const key of keys) {
      // Если значение свойства a[key] меньше, чем b[key],
      // возвращаем -1, если направление сортировки по возрастанию
      // (direction равен true). Если направление сортировки по убыванию, возвращаем 1.
      if (a[key] < b[key]) return direction ? -1 : 1;
      // Если значение свойства a[key] больше, чем b[key], возвращаем
      // 1 для сортировки по возрастанию и -1 для сортировки по убыванию.
      if (a[key] > b[key]) return direction ? 1 : -1;
      // Если значения равны, возвращается 0, что означает, что порядок
      // этих элементов относительно друг друга не изменится.
      return 0;
      }
    });
  };

  // Сортировка по Ф.И.О.
  sortFIO.addEventListener('click', () => {
    sortDirection.userFIO = !sortDirection.userFIO;
    sortStudents(['surname', 'name', 'lastname'], sortDirection.userFIO);
    renderStudentList(studentsList);
  });

  // Сортировка по факультету
  sortFaculty.addEventListener('click', () => {
    sortDirection.faculty = !sortDirection.faculty;
    sortStudents(['faculty'], sortDirection.faculty);
    renderStudentList(studentsList);
  });

  // Сортировка по дате рождения
  sortBirthDay.addEventListener('click', () => {
    sortDirection.birthday = !sortDirection.birthday;
    sortStudents(['birthday'], sortDirection.birthday);
    renderStudentList(studentsList);
  });

  // Сортировка по году начала обучения
  sortStartYear.addEventListener('click', () => {
    sortDirection.studyStart = !sortDirection.studyStart;
    sortStudents(['studyStart'], sortDirection.studyStart);
    renderStudentList(studentsList);
  });

  // фильтрация
  // чтобы форма не отправяллась
  formFilter.addEventListener('submit', (event) => {
    event.preventDefault();
  });

  // функция фильтрации
  const filterStudents = () => {
    // .value получает текущее значение элемента в виде строки.
    // .trim() удаляет начальные и конечные пробелы в строке,
    // чтобы избежать лишних пробелов при фильтрации.
    // .toLowerCase() приводит все символы в строке к нижнему
    // регистру для регистронезависимого сравнения.
    const filterFIOValue = filterFIO.value.trim().toLowerCase();
    const filterFacultyValue = filterFaculty.value.trim().toLowerCase();
    // parseInt() преобразует строку в число. Это важно,
    // так как год начала обучения должен быть числом для сравнения.
    const filterStartYearValue = parseInt(filterStartYear.value.trim());
    const filterEndYearValue = parseInt(filterEndYear.value.trim());
    // фильтрация списка студентов

    // filteredStudents новый массив содержит все заданные критерия возврошаемых элементов
    const filteredStudents = studentsList.filter((student) => {
      // сравнение без учёта регистра
      const fullName = `${student.name} ${student.surname} ${student.lastname}`.toLowerCase();
      // !filterFIOValue проверяет, что filterFIOValue не задано или пусто.
      // В этом случае условие matchesFIO будет true, так как фильтрация по ФИО не требуется.
      const matchesFIO = !filterFIOValue || fullName.includes(filterFIOValue);
      const faculty = student.faculty.toLowerCase();
      const matchesFaculty = !filterFacultyValue || faculty.includes(filterFacultyValue);
      const matchesStartYear = isNaN(filterStartYearValue) || student.studyStart >= filterStartYearValue;
      const matchesEndYear = isNaN(filterEndYearValue) || (student.studyStart + 4) <= filterEndYearValue;

      // возрощаемые элемнеты
      return matchesFIO && matchesFaculty && matchesStartYear && matchesEndYear;
    });

    renderStudentList(filteredStudents);
  };

  filterFIO.addEventListener('input', filterStudents);
  filterFaculty.addEventListener('input', filterStudents);
  filterStartYear.addEventListener('input', filterStudents);
  filterEndYear.addEventListener('input', filterStudents);

});
