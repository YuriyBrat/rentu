'use client'

// import "./App.css";
import axios from "axios";
import { toast } from 'react-toastify';

import { FaLocationArrow, FaPaperPlane, FaPhoneVolume } from "react-icons/fa";

import AOS from 'aos' //дає красиві і плавні появлення блоків
import 'aos/dist/aos.css'
import Swiper from './assets/vendor/swiper/swiper-bundle.min.js'
import './assets/vendor/swiper/swiper-bundle.min.css'

import { useEffect, useState, useRef } from 'react'

{/* <!-- Vendor CSS Files --> */ }
import './assets/vendor/bootstrap/css/bootstrap.min.css' // додаткова стилістика присутня

import './assets/vendor/bootstrap-icons/bootstrap-icons.css' // іконки присуні всі

import './assets/stylesheets/styles.css'
import './assets/stylesheets/mystyles.scss'

// {/* <!-- Vendor JS Files --> */}
//! import './assets/vendor/bootstrap/js/bootstrap.bundle.min.js'
// import './assets/vendor/aos/aos.js'
// import './assets/vendor/swiper/swiper-bundle.min.js'
// {/* <!-- Template Main JS File --> */}
// import './assets/javascripts/main.js'

import { sendMessageTelegram } from "@/hooks/telegram.js";

const HomeZra = () => {
  const refPreLoader = useRef();
  const [phone, setPhone] = useState('098 688 0919');

  // Animation on scroll function and init
  function aos_init() {

    AOS.init({
      duration: 1000,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
  }

  const setTriangleStyle = () => {
    const form = document?.getElementsByClassName('myform')[0];
    if (form) {
      // const btn = form?.getElementsByTagName('BUTTON')[0];
      const btn = form?.getElementsByClassName('btn-send')[0];
      if (btn) {
        const wBtn = window.getComputedStyle(btn).width;
        const tri = form?.getElementsByClassName('triangle-house')[0];

        tri.style.borderLeftWidth = wBtn.match(/\d+/g)[0] / 2 + 'px'
        tri.style.borderRightWidth = wBtn.match(/\d+/g)[0] / 2 + 'px'
      }
    }
  };

  //creating IP state
  const [ip, setIP] = useState("");
  const getApi = async () => {
    const res = await axios.get("https://api.ipify.org/?format=json");
    // console.log(res.data.ip);
    setIP(res.data.ip);
  };

  // обнулена форма
  const fieldsZero = {
    name: '',
    phone: '',
    email: '',
    ip: '',
    notes: ''
  }

  const [fields, setFields] = useState(fieldsZero);




  useEffect(() => {
    // console.log(fields);

    setTriangleStyle();

    getApi();

    // console.log(navigator);
    // if (navigator.geolocation) {
    //   navigator.permissions
    //     .query({ name: "geolocation" })
    //     .then(function (result) {
    //       console.log(result);
    //     });
    // } else {
    //   console.log("Geolocation is not supported by this browser.");
    // }

    /**
 * Preloader
 */
    // const preloader = document.getElementById('preloader') //querySelector('#preloader');
    refPreLoader.current.remove();
    // if (preloader) {
    //   window.addEventListener('load', () => {
    //     preloader.remove();
    //   });
    // };

    // window.addEventListener('load', () => {
    //   aos_init();
    // });
    aos_init();

    // Clients Slider
    new Swiper('.clients-slider', {
      speed: 400,
      loop: true,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false
      },
      slidesPerView: 'auto',
      pagination: {
        el: '.swiper-pagination',
        type: 'bullets',
        clickable: true
      },
      breakpoints: {
        320: {
          slidesPerView: 2,
          spaceBetween: 40
        },
        480: {
          slidesPerView: 3,
          spaceBetween: 60
        },
        640: {
          slidesPerView: 3,
          spaceBetween: 80
        },
        992: {
          slidesPerView: 5,
          spaceBetween: 120
        }
      }
    });

    /**
     * Init swiper slider with 1 slide at once in desktop view
     */
    //! Поки не найшов його на сторінці
    // new Swiper('.slides-1', {
    //   speed: 600,
    //   loop: true,
    //   autoplay: {
    //     delay: 5000,
    //     disableOnInteraction: false
    //   },
    //   slidesPerView: 'auto',
    //   pagination: {
    //     el: '.swiper-pagination',
    //     type: 'bullets',
    //     clickable: true
    //   },
    //   navigation: {
    //     nextEl: '.swiper-button-next',
    //     prevEl: '.swiper-button-prev',
    //   }
    // });


    // Init swiper slider with 3 slides at once in desktop view
    new Swiper('.slides-3', {
      speed: 600,
      loop: true,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false
      },
      slidesPerView: 'auto',
      pagination: {
        el: '.swiper-pagination',
        type: 'bullets',
        clickable: true
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      breakpoints: {
        320: {
          slidesPerView: 1,
          spaceBetween: 40
        },

        1200: {
          slidesPerView: 2,
        }
      }
    });

    /**
   * Sticky Header on Scroll
   */
    const selectHeader = document.querySelector('#header');
    if (selectHeader) {
      let headerOffset = selectHeader.offsetTop;
      let nextElement = selectHeader.nextElementSibling;

      const headerFixed = () => {
        if ((headerOffset - window.scrollY) <= 0) {
          selectHeader.classList.add('sticked');
          if (nextElement) nextElement.classList.add('sticked-header-offset');
        } else {
          selectHeader.classList.remove('sticked');
          if (nextElement) nextElement.classList.remove('sticked-header-offset');
        }
      }
      window.addEventListener('load', headerFixed);
      document.addEventListener('scroll', headerFixed);
    };


    /**
  * Navbar links active state on scroll
  */
    let navbarlinks = document.querySelectorAll('#navbar a');

    function navbarlinksActive() {
      navbarlinks.forEach(navbarlink => {

        if (!navbarlink.hash) return;

        let section = document.querySelector(navbarlink.hash);
        if (!section) return;

        let position = window.scrollY + 200;

        if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
          navbarlink.classList.add('active');
        } else {
          navbarlink.classList.remove('active');
        }
      })
    }
    window.addEventListener('load', navbarlinksActive);
    document.addEventListener('scroll', navbarlinksActive);


    /**
   * Mobile nav toggle
   */
    const mobileNavShow = document.querySelector('.mobile-nav-show');
    const mobileNavHide = document.querySelector('.mobile-nav-hide');

    document.querySelectorAll('.mobile-nav-toggle').forEach(el => {
      el.addEventListener('click', function (event) {
        event.preventDefault();
        mobileNavToogle();
      })
    });

    function mobileNavToogle() {
      document.querySelector('body').classList.toggle('mobile-nav-active');
      mobileNavShow.classList.toggle('d-none');
      mobileNavHide.classList.toggle('d-none');
    }

    /**
     * Hide mobile nav on same-page/hash links
     */
    document.querySelectorAll('#navbar a').forEach(navbarlink => {

      if (!navbarlink.hash) return;

      let section = document.querySelector(navbarlink.hash);
      if (!section) return;

      navbarlink.addEventListener('click', () => {
        if (document.querySelector('.mobile-nav-active')) {
          mobileNavToogle();
        }
      });

    });

    /**
     * Toggle mobile nav dropdowns
     */
    const navDropdowns = document.querySelectorAll('.navbar .dropdown > a');

    navDropdowns.forEach(el => {
      el.addEventListener('click', function (event) {
        if (document.querySelector('.mobile-nav-active')) {
          event.preventDefault();
          this.classList.toggle('active');
          this.nextElementSibling.classList.toggle('dropdown-active');

          let dropDownIndicator = this.querySelector('.dropdown-indicator');
          dropDownIndicator.classList.toggle('bi-chevron-up');
          dropDownIndicator.classList.toggle('bi-chevron-down');
        }
      })
    });


    /**
   * Scroll top button
   */
    const scrollTop = document.querySelector('.scroll-top');
    if (scrollTop) {
      const togglescrollTop = function () {
        window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
      }
      window.addEventListener('load', togglescrollTop);
      document.addEventListener('scroll', togglescrollTop);
      scrollTop.addEventListener('click', window.scrollTo({
        top: 0,
        behavior: 'smooth'
      }));
    }

  }, []);  //fields




  // дописав щоб відкривалась менюха питань але вона поки не плавна(())
  const toggleFaq = e => {
    const el = e.currentTarget;
    const elDiv = el?.parentElement?.parentElement?.getElementsByTagName('DIV')[0];
    if (e.target.className.includes("collapsed")) {
      // setClassPost('accordion-button')
      el.className = 'accordion-button'
      elDiv.className = 'accordion-collapse show'
    } else {
      // setClassPost('accordion-button collapsed')
      el.className = 'accordion-button collapsed'
      elDiv.className = 'accordion-collapse collapse'
    }
  };

  // ф-я перевірки номеру телефону і вирізки усіх символів крім цифр
  const checkPhone = str => {
    let newstr = "";
    let errCount = 0;
    let errText = "";
    try {
      str = str.trim();
      for (let i = 0; i < str.length; i++) {
        let s = str[i];
        switch (true) {
          case (i == 0 && (s == "+" || s == 0)): newstr += s; break;
          // case (i == 0): newstr += parseInt(s); break;
          default: {
            if (Number.isInteger(Number(s))) {
              newstr += s
            }
          }
        }
      }
    } catch (error) {
      return newstr
    }


    // 2 step. Check correct number
    const lenNum = newstr.length;
    if (lenNum > 0) {
      const sFirst = str[0].toString();
      const sSec = str[1].toString();
      switch (lenNum) {
        case 9: {
          if (sFirst !== "0" && sFirst !== "+") {
            newstr = "0" + newstr
          } else {
            errCount++;
            errText = "Будь ласка, виправте неправильний номер телефону"
          }
        };
          break;
        case 10: {
          if (sFirst !== "0" && sFirst !== "+") {
            errCount++;
            errText = "Будь ласка, виправте неправильний номер телефону"
          } else if (sFirst == "+" && sSec != "0") {
            newstr = "0" + newstr.substring(1); //cut + and add 0
          }
        };
          break;
        case 11: {
          if (sFirst == "8" && sSec == "0") {
            newstr = newstr.substring(1); //cut 8
          } else if (sFirst == "3" && sSec == "0") {
            newstr = newstr.substring(1); //cut 3
          } else if (sFirst == "+" && sSec == "0") {
            newstr = newstr.substring(1); //cut +
          } else {
            errCount++;
            errText = "Будь ласка, виправте неправильний номер телефону"
          }
        };
          break;
        case 12: {
          if (newstr.substring(0, 3) == "380") {
            newstr = "+" + newstr
          } else if (newstr.substring(0, 3) == "+80" || newstr.substring(0, 3) == "+30" || newstr.substring(0, 3) == "+38") {
            newstr = "+380" + newstr.substring(3);
          } else {
            errCount++;
            errText = "Будь ласка, виправте неправильний номер телефону"
          }
        };
          break;
        case 13: {
          if (newstr.substring(0, 4) != "+380") {
            errCount++;
            errText = "Будь ласка, виправте неправильний номер телефону"
          }
        };
          break;
        default: {
          errCount++;
          errText = "Будь ласка, виправте неправильний номер телефону"
        }
      }
    }
    // console.log('Перевірений номер телефону ' + newstr);
    return { newstr, errCount, errText }
  }

  const handleChange = (e) => {
    let { name, value } = e.target;
    // Check if nested property

    // if (name == "phone") {
    //   value = checkPhone(value);
    // }

    if (name.includes('.')) {
      const [outerKey, innerKey] = name.split('.');

      setFields((prevFields) => ({
        ...prevFields,
        [outerKey]: {
          ...prevFields[outerKey],
          [innerKey]: value,
        },
      }));
    } else {
      // Not nested
      setFields((prevFields) => ({
        ...prevFields,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {

    e.preventDefault();
    // 1 STEP. Check phone number

    const { newstr, errCount, errText } = checkPhone(fields.phone);

    if (errCount > 0) {
      toast.error(errText);
      return
    } else {
      fields.phone = newstr

      // Формуємо смс для телеграм і відправляємо ))
      // Символи переносу строки %0A   або  "\r\n" або \n
      const messageToSend = `Отримано заявку із сайту для Продавців. %0A Ім'я: ${fields.name}
      %0A Телефон: ${fields.phone} %0A Емейл: ${fields.email} %0A Побажання: ${fields.notes}`;
      await sendMessageTelegram(messageToSend);
    }


    const formData = { ...fields, ip }

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      // const resData = await res.json();
      if (res.status === 200) {
        toast.success('Дякуємо за звернення! Очікуйте дзвінка');
      } else {
        toast.error('Помилка надсилання даних...')
      }
    } catch (error) {
      // console.log(error);
      toast.error('Помилка надсилання даних...')
    } finally {
      setFields(fieldsZero)
    }
  };




  return (

    <>
      <header id="header" className="header d-flex align-items-center">
        <div className="container-fluid container-xl d-flex align-items-center justify-content-between">
          <a href="#" className="logo d-flex align-items-center">
            <h1>
              Rentu<span>.</span>
            </h1>
          </a>
          <a href={"tel: +38" + phone} className="mynumber1">
            <FaPhoneVolume />
            <span>{phone}</span>
          </a>
          <nav id="navbar" className="navbar">
            <ul>
              <li>
                <a href="#hero">Головна</a>
              </li>
              <li>
                <a href="#about">Про нас</a>
              </li>
              <li>
                <a href="#testimonials">Відгуки</a>
              </li>
              <li>
                <a href="#team">Команда</a>
              </li>
              <li>
                <a href="#faq">Поради</a>
              </li>
              <li>
                <a href="#recent-posts">Статті</a>
              </li>
              {/* <li className="dropdown">
                <a href="#">
                  <span>Меню</span>{" "}
                  <i className="bi bi-chevron-down dropdown-indicator" />
                </a>
                <ul>
                  <li>
                    <a href="#">Ціни</a>
                  </li>
                  <li>
                    <a href="#">Послуги</a>
                  </li>
                  <li>
                    <a href="#">Правила &amp; Умови</a>
                  </li>
                  <li>
                    <a href="#">Політика конфіденційності</a>
                  </li>
                </ul>
              </li> */}

            </ul>
          </nav>
          {/* .navbar */}
          <i className="mobile-nav-toggle mobile-nav-show bi bi-list" />
          <i className="mobile-nav-toggle mobile-nav-hide d-none bi bi-x" />
        </div>
      </header>
      {/* /* End Header */}
      {/* /* - - - - - - - -  Hero Section - - - - - - - -  */}
      <section id="hero" className="hero">
        <div className="container position-relative">
          <div className="row gy-2" data-aos="fade-in">
            <div className="col-lg-12  order-lg-1 d-flex flex-column justify-content-center text-center caption">
              <h2>
                Вас Вітає <span>Rentu</span>
                <span className="circle">.</span>
              </h2>
              <p className="mytext2">Компанія нерухомості із новітньою діджиталізованою технологією продажу квартир</p>
              <div className="mytext1">
                ПРОДАВАЙ НЕРУХОМІСТЬ ТУТ
                <span className="circle">.</span>
              </div>



              <form className="row g-1 col-xl-6 col-lg-8 col-sm-10 col-10   m-auto myform"
                // action='/api/leads'
                // method='POST'
                // encType='multipart/form-data'
                onSubmit={handleSubmit}
              >

                <div className="col-md-2"></div>
                <div className="col-md-8">
                  <div className="triangle-house mx-auto"></div>
                </div>
                <div className="col-md-2"></div>

                <div className="col-md-2"></div>
                <div className="col-md-8">
                  {/* <label for="inputAddress" className="form-label">Address</label> */}
                  <input type="text" className="form-control" id="inputName" placeholder="Як до Вас звертатись?"
                    name='name'
                    value={fields.name}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-2"></div>

                <div className="col-md-2"></div>
                <div className="col-md-4">
                  {/* <label for="inputEmail4" className="form-label">Email</label> */}
                  <input type="text" className="form-control" id="inputPhonel4" placeholder="Телефон..."
                    name='phone'
                    value={fields.phone}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-4">
                  {/* <label for="inputPassword4" className="form-label">Password</label> */}
                  <input type="text" className="form-control" id="inputEmail4" placeholder="Емейл..."
                    name='email'
                    value={fields.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-2"></div>

                <div className="col-md-2"></div>
                <div className="col-md-8">
                  {/* <label for="inputAddress" className="form-label">Address</label> */}
                  <input type="text" className="form-control" id="inputNotes" placeholder="Залиште Ваше побажання..."
                    name='notes'
                    value={fields.notes}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-2"></div>


                <div className="col-md-2"></div>
                <div className="col-md-8">
                  {/* <label for="inputAddress" className="form-label">Address</label> */}
                  <button
                    type="submit"
                    className="btn-send btn col-12">
                    <FaPaperPlane className="mx-auto" />
                  </button>
                </div>
                <div className="col-md-2"></div>

                {/* <div className="col-md-6">
                  <label for="inputCity" className="form-label">City</label>
                  <input type="text" className="form-control" id="inputCity"/>
                </div>
                <div className="col-md-4">
                  <label for="inputState" className="form-label">State</label>
                  <select id="inputState" className="form-select">
                    <option selected>Choose...</option>
                    <option>...</option>
                  </select>
                </div> */}
                {/* <div className="col-md-2">
                  <label for="inputZip" className="form-label">Zip</label>
                  <input type="text" className="form-control" id="inputZip"/>
                </div> */}

                {/* <div className="col-12">
                  <button type="submit" className="btn btn-primary">Sign in</button>
                </div> */}
              </form>







            </div>
          </div>
        </div >
        <div className="icon-boxes position-relative">
          <div className="container position-relative">
            <div className="row gy-4 mt-5 justify-content-center">
              <div
                // className="col-xl-4 col-md-4"
                className="col-lg-4 col-md-10"
                data-aos="fade-up"
                data-aos-delay={100}
              >
                <div className="icon-box">
                  <div className="icon">
                    <i className="bi bi-fullscreen" />
                  </div>
                  <h4 className="title">
                    <a href="#call-to-action" className="stretched-link">
                      Персоналізований сайт об'єкту продажу
                    </a>
                  </h4>
                </div>
              </div>
              {/*End Icon Box */}
              <div
                // className="col-xl-4 col-md-4 card-two"
                className="col-lg-4 col-md-5"
                data-aos="fade-up"
                data-aos-delay={200}
              >
                <div className="icon-box">
                  <div className="icon">
                    <i className="bi bi-headset" />
                  </div>
                  <h2 className="title">
                    <a href="#about" className="stretched-link">
                      7 днів - 7 кроків
                    </a>
                  </h2>
                  <h4 className="title">
                    <a href="#about" className="stretched-link">
                      Ефективна стратегія продажу
                    </a>
                  </h4>
                </div>
              </div>
              {/*End Icon Box */}
              <div
                // className="col-xl-4 col-md-4"
                className="col-lg-4 col-md-5"
                data-aos="fade-up"
                data-aos-delay={500}
              >
                <div className="icon-box">
                  <div className="icon">
                    <i className="bi bi-person-check" />
                  </div>
                  <h4 className="title">
                    <a href="#about" className="stretched-link">
                      Переговорний супровід та сервісна підтримка
                    </a>
                  </h4>
                </div>
              </div>
              {/*End Icon Box */}
            </div>
          </div>
        </div>
      </section >

      <div id="main">
        {/* - - - - - - - -  About Us Section - - - - - - - -   */}
        <section id="about" className="about">
          <div className="container" data-aos="fade-up">
            <div className="section-header">
              <h2>Про нас</h2>
              <p>Щоденно наші результати збільшуються, а професіоналізм зростає</p>
            </div>
            <div className="row gy-1">
              <div className="col-lg-5">
                <img
                  src="land1/images/kiop.jpg"
                  className="img-fluid rounded-4 mb-4"
                  alt=""
                />
              </div>
              {/* <div className="col-lg-5">
                <iframe style={{ width: '100%', height: '315px' }}
                  src="https://www.youtube.com/embed/ZV16ev0n9J8"
                  // src="https://www.youtube.com/watch?v=5OxvvaPIUpYs"
                  title="Discover thousands of easy-to-customize templates || ZRTHEMES"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen=""></iframe>
              </div> */}
              <div className="col-lg-7">
                <div className="content ps-0 ps-lg-5">
                  <p>
                    Наша кваліфікація - продаж нерухомості на первинному та вторинному ринках Львова та передмісті.
                    Пропонуємо три напрацьовані стратегії для продажу Вашої нерухомості та якісний індивідуальний підхід
                    для пошуку та купівлі. В арсеналі наших вмінь - десятки рекламних тактик, великий штат експертів з продажу
                    та переговорів, напрацьовані бази та програмні інформаційні сервіси.
                  </p>
                  <ul>
                    <li>
                      <i className="bi bi-1-square" /> Наш досвід - продано більше 500 об'єктів нерухомості.
                    </li>
                    <li>
                      <i className="bi bi-2-square" /> Щоденно до нас звертається більше 10 потенційних клієнтів на купівлю.
                    </li>
                    <li>
                      <i className="bi bi-3-square" /> Ми володіємо базою понад 1000 квартир у Львові для продажу.
                    </li>
                    <li>
                      <i className="bi bi-4-square" /> На даний час підтримуємо актуальність понад 200 замовлень на купівлю нерухомості у Львові
                      різної сегментації.
                    </li>
                    <li>
                      <i className="bi bi-5-square" /> Маємо готову напрацьовану стратегію продажу квартири "7 днів - 7 кроків"{" "}
                    </li>
                    <li>
                      <i className="bi bi-6-square" /> Використовуємо більше 100 рекламних площадок та маркетплейсів для рекламної компанії
                      об'єкту.
                    </li>
                    <li>
                      <i className="bi bi-7-square" /> Даруємо персоналізований особистий сайт-візитівку Вашого об'єкту нерухомості
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>



        {/* - - - - - - - -  Clients Section - - - - - - - -   */}
        <section id="clients" className="clients">
          <div className="container" data-aos="zoom-out">
            <div className="clients-slider swiper">
              <div className="swiper-wrapper align-items-center">
                <div className="swiper-slide">
                  <img
                    src="land1/images/clients/client-1.png"
                    className="img-fluid"
                    alt=""
                  />
                </div>
                <div className="swiper-slide">
                  <img
                    src="land1/images/clients/client-2.png"
                    className="img-fluid"
                    alt=""
                  />
                </div>
                <div className="swiper-slide">
                  <img
                    src="land1/images/clients/client-3.png"
                    className="img-fluid"
                    alt=""
                  />
                </div>
                <div className="swiper-slide">
                  <img
                    src="land1/images/clients/client-4.png"
                    className="img-fluid"
                    alt=""
                  />
                </div>
                <div className="swiper-slide">
                  <img
                    src="land1/images/clients/client-5.png"
                    className="img-fluid"
                    alt=""
                  />
                </div>
                <div className="swiper-slide">
                  <img
                    src="land1/images/clients/client-6.png"
                    className="img-fluid"
                    alt=""
                  />
                </div>
                <div className="swiper-slide">
                  <img
                    src="land1/images/clients/client-7.png"
                    className="img-fluid"
                    alt=""
                  />
                </div>
                <div className="swiper-slide">
                  <img
                    src="land1/images/clients/client-8.png"
                    className="img-fluid"
                    alt=""
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* - - - - - - - -  Call To Action Section - - - - - - - -  */}

        <section id="call-to-action" className="call-to-action">
          <div className="container text-center" data-aos="zoom-out">
            <h3>Готові отримати сайт об'єкту зараз?</h3>
            <p> Вкажіть основні параметри об'єкту для першої демонстрації сайту</p>
            <a className="cta-btn" href="mailto:info@example.com">
              Напишіть нам
            </a>
          </div>
        </section>
        {/* End Call To Action Section */}



        {/* - - - - - - - -  Testimonials Section - - - - - - - -  */}
        <section id="testimonials" className="testimonials">
          <div className="container" data-aos="fade-up">
            <div className="section-header">
              <h2>Відгуки</h2>
              <p>Ми вкладемо найкращі навички для появи у стрічці Вашої подяки</p>
            </div>
            <div
              className="slides-3 swiper"
              data-aos="fade-up"
              data-aos-delay={100}
            >
              <div className="swiper-wrapper">
                <div className="swiper-slide">
                  <div className="testimonial-wrap">
                    <div className="testimonial-item">
                      <div className="d-flex align-items-center info-box">
                        <img
                          src="/land1/images/testimonials/testimonial-1.jpg"
                          // src="./assets/images/testimonials/testimonial-1.jpg"
                          // src="/land1/properties/a1.jpg"
                          // src={testImg.src}
                          className="testimonial-img flex-shrink-0"
                          alt=""
                        />
                        <div>
                          <h3>Олександр Іванців</h3>
                          <h4>архітектор</h4>
                          <div className="stars">
                            <i className="bi bi-star-fill" />
                            <i className="bi bi-star-fill" />
                            <i className="bi bi-star-fill" />
                            <i className="bi bi-star-fill" />
                            <i className="bi bi-star-fill" />
                          </div>
                        </div>
                      </div>
                      <p>
                        <i className="bi bi-quote quote-icon-left" />
                        Чудова робота. Ми з дружиною два місяці потратили впусту перш ніж познайомилися
                        із професіоналами своєї справи. Якісний підбір і хороший сервіс.
                        Дякуємо за отриманий затишок у власному будинку.
                        <i className="bi bi-quote quote-icon-right" />
                      </p>
                    </div>
                  </div>
                </div>
                {/* End testimonial item */}
                <div className="swiper-slide">
                  <div className="testimonial-wrap">
                    <div className="testimonial-item">
                      <div className="d-flex align-items-center info-box">
                        <img
                          src="/land1/images/testimonials/testimonial-2.jpg"
                          className="testimonial-img flex-shrink-0"
                          alt=""
                        />
                        <div>
                          <h3>Інна Ільтишівська</h3>
                          <h4>Веб Дизайнер</h4>
                          <div className="stars">
                            <i className="bi bi-star-fill" />
                            <i className="bi bi-star-fill" />
                            <i className="bi bi-star-fill" />
                            <i className="bi bi-star-fill" />
                            <i className="bi bi-star-fill" />
                          </div>
                        </div>
                      </div>
                      <p>
                        <i className="bi bi-quote quote-icon-left" />
                        Я вражена, приємно і навіть дуже. Чітко розуміла, чого хочу.
                        Дала конкретний запит на пошук квартири. Я заїхала з чемоданом на восьмий день після
                        звернення. Це мега зручно, безпечно і професійно! Дякую
                        <i className="bi bi-quote quote-icon-right" />
                      </p>
                    </div>
                  </div>
                </div>
                {/* End testimonial item */}
                <div className="swiper-slide">
                  <div className="testimonial-wrap">
                    <div className="testimonial-item">
                      <div className="d-flex align-items-center info-box">
                        <img
                          src="/land1/images/testimonials/testimonial-3.jpg"
                          className="testimonial-img flex-shrink-0"
                          alt=""
                        />
                        <div>
                          <h3>Павло Островський</h3>
                          <h4>Наковий діяч</h4>
                          <div className="stars">
                            <i className="bi bi-star-fill" />
                            <i className="bi bi-star-fill" />
                            <i className="bi bi-star-fill" />
                            <i className="bi bi-star-fill" />
                            <i className="bi bi-star-fill" />
                          </div>
                        </div>
                      </div>
                      <p>
                        <i className="bi bi-quote quote-icon-left" />
                        Звернулися продати та купити більшу.
                        Важко уявити як провернути процес і склеєти всі деталі.
                        Були переживання, але з першими кроками роботи відчули
                        безпеку і професіоналізм фахівців.
                        Важливо, коли дійсно відстоюють твої інтереси, що ми і отримали.
                        <i className="bi bi-quote quote-icon-right" />
                      </p>
                    </div>
                  </div>
                </div>
                {/* End testimonial item */}
                <div className="swiper-slide">
                  <div className="testimonial-wrap">
                    <div className="testimonial-item">
                      <div className="d-flex align-items-center info-box">
                        <img
                          src="/land1/images/testimonials/testimonial-4.jpg"
                          className="testimonial-img flex-shrink-0"
                          alt=""
                        />
                        <div>
                          <h3>Марія Франкова</h3>
                          <h4>Таргетолог</h4>
                          <div className="stars">
                            <i className="bi bi-star-fill" />
                            <i className="bi bi-star-fill" />
                            <i className="bi bi-star-fill" />
                            <i className="bi bi-star-fill" />
                            <i className="bi bi-star-fill" />
                          </div>
                        </div>
                      </div>
                      <p>
                        <i className="bi bi-quote quote-icon-left" />
                        Вау, вау, вау! Ми не могли чотири місяці продати будинок,
                        при чому навіть переглядів і було небагато. З першого дня роботи рієлтори
                        компанії показали активність та конкретні дії, на другий день вже було дві
                        пропозиції. За тиждень ПРОДАНО. Дякую
                        <i className="bi bi-quote quote-icon-right" />
                      </p>
                    </div>
                  </div>
                </div>
                {/* End testimonial item */}
              </div>
              <div className="swiper-pagination" />
            </div>
          </div>
        </section>



        {/* - - - - - - - -  Our Team Section - - - - - - - -  */}
        <section id="team" className="team sections-bg">
          <div className="container" data-aos="fade-up">
            <div className="section-header">
              <h2>Наша Команда</h2>
              <p>Досвідчені фахівці, які чекають на якісне виконання Ваших потреб</p>
            </div>

            <div className="row gy-4">
              <div
                className="col-xl-3 col-md-6 d-flex"
                data-aos="fade-up"
                data-aos-delay={100}
              >
                <div className="member">
                  <div className="social">
                    <a href="">
                      <i className="bi bi-twitter" />
                    </a>
                    <a href="">
                      <i className="bi bi-facebook" />
                    </a>
                    <a href="">
                      <i className="bi bi-linkedin" />
                    </a>
                    <a href="">
                      <i className="bi bi-instagram" />
                    </a>
                  </div>
                  <img
                    src="/land1/images/team/hyty.jpeg"
                    className="img-fluid"
                    alt=""
                  />
                  <h4>Ірина Огородник</h4>
                  <span>Виконавчий директор</span>
                </div>
              </div>
              {/* End Team Member */}
              <div
                className="col-xl-3 col-md-6 d-flex"
                data-aos="fade-up"
                data-aos-delay={200}
              >
                <div className="member">
                  <div className="social">
                    <a href="">
                      <i className="bi bi-twitter" />
                    </a>
                    <a href="">
                      <i className="bi bi-facebook" />
                    </a>
                    <a href="">
                      <i className="bi bi-linkedin" />
                    </a>
                    <a href="">
                      <i className="bi bi-instagram" />
                    </a>
                  </div>
                  <img
                    src="/land1/images/team/team-2.jpg"
                    className="img-fluid"
                    alt=""
                  />
                  <h4>Сергій Станійчук</h4>
                  <span>Експерт з нерухомості</span>
                </div>
              </div>
              {/* End Team Member */}
              <div
                className="col-xl-3 col-md-6 d-flex"
                data-aos="fade-up"
                data-aos-delay={300}
              >
                <div className="member">
                  <div className="social">
                    <a href="">
                      <i className="bi bi-twitter" />
                    </a>
                    <a href="">
                      <i className="bi bi-facebook" />
                    </a>
                    <a href="">
                      <i className="bi bi-linkedin" />
                    </a>
                    <a href="">
                      <i className="bi bi-instagram" />
                    </a>
                  </div>
                  <img
                    src="/land1/images/team/zht.jpeg"
                    className="img-fluid"
                    alt=""
                  />
                  <h4>Марія Синявська</h4>
                  <span>Рієлтор</span>
                </div>
              </div>
              {/* End Team Member */}
              <div
                className="col-xl-3 col-md-6 d-flex"
                data-aos="fade-up"
                data-aos-delay={400}
              >
                <div className="member">
                  <div className="social">
                    <a href="">
                      <i className="bi bi-twitter" />
                    </a>
                    <a href="">
                      <i className="bi bi-facebook" />
                    </a>
                    <a href="">
                      <i className="bi bi-linkedin" />
                    </a>
                    <a href="">
                      <i className="bi bi-instagram" />
                    </a>
                  </div>
                  <img
                    src="/land1/images/team/yty.jpeg"
                    className="img-fluid"
                    alt=""
                  />
                  <h4>Ольга Малінковська</h4>
                  <span>Рієлтор</span>
                </div>
              </div>

              {/* End Team Member */}
            </div>
          </div>
        </section>



        {/* - - - - - - - -  Frequently Asked Questions Section - - - - - - - -  */}
        <section id="faq" className="faq">
          <div className="container" data-aos="fade-up">
            <div className="row gy-4">
              <div className="col-lg-12">
                <div className="content text-center">
                  <h3>
                    Найбільш поширені <strong>ЗАПИТАННЯ</strong>
                  </h3>
                  <p>Ми радо надамо відповідь на важливе Ваше запитання. БЕЗКОШТОВНО онлайн</p>
                </div>
              </div>
              <div className="col-lg-12">
                <div
                  className="accordion accordion-flush"
                  id="faqlist"
                  data-aos="fade-up"
                  data-aos-delay={100}
                >
                  <div className="accordion-item">
                    <h3 className="accordion-header">
                      <button
                        onClick={toggleFaq}
                        className="accordion-button collapsed"
                        // className={classPost}
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#faq-content-1"
                      >
                        <span className="num">
                          <i className="bi bi-1-square" />
                        </span>
                        Як визначити вартість нерухомості?
                      </button>
                    </h3>
                    <div
                      id="faq-content-1"
                      className="accordion-collapse collapse"
                      data-bs-parent="#faqlist"
                    >
                      <div className="accordion-body">
                        Існує 3 основні підходи до визначення вартості нерухомості -
                        витратний, прибутковий і звісно ринковий. У новобудовах з ремонтами
                        здебільшого керуються витратним. Якщо об'єкт приносить дохід можна опиратися на
                        прибутковий. Вважається нормою від 8% річного доходу з оренди.
                        Ринковий основний! Врахуйте, що вторинний ринок та новобуди з ремонтами не рахують
                        у метрах квадратних, а лише цілісно, враховуючи кінцеві недоліки та переваги.
                        Пам'ятайте - один недолік відштовхує більше, ніж п'ять альтернативних переваг!
                        Отже, кроки для визначення вартості:
                        <ul>
                          <li>1. Вибрати усі подібні об'єкти кокретної ніші: клас будинку, стан ремонту, популяризація району</li>
                          <li>2. Оцінити кількість конкурентних квартир</li>
                          <li>3. Вибрати 5 з найменшими цінами, обдзвонити, дізнатися актуальність, правдивість, найменшу вартість
                            та термін на ринку</li>
                          <li>4. Середня вартість із найменших цін і є максимальною вартістю Вашого об'єкту</li>
                        </ul>
                        Все, що вище цієї вартості, це - або явні переваги, або удача появи конкретного покупця,
                        або професійність досвідченого агента з продажу нерухомості, це статистично +8% додаткової вигоди!

                        Ми радо допоможимо визначити вартість вашого об'єкту.
                      </div>
                    </div>
                  </div>
                  {/* # Faq item*/}
                  <div className="accordion-item">
                    <h3 className="accordion-header">
                      <button
                        onClick={toggleFaq}
                        className="accordion-button collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#faq-content-2"
                      >
                        <span className="num">
                          <i className="bi bi-2-square" />
                        </span>
                        Реклама на яких ресурсах дає найбільший потік клієнтів?
                      </button>
                    </h3>
                    <div
                      id="faq-content-2"
                      className="accordion-collapse collapse"
                      data-bs-parent="#faqlist"
                    >
                      <div className="accordion-body">
                        Якісна реклама потребує кваліфікації та фінансових вкладень.
                        Маркетинг - це наука, це мистецтво...
                        Є різні канали просування - сайти, соціальні мережі, форуми, сарафанне радіо.
                        Найбільш ефективний спосіб - використовувати цільові сайти.
                        Для оцінки напишіть у пошуковому рядку Google вашу потребу очима клієнта - наприклад,
                        КУПИТИ КВАРТИРУ У ЛЬВОВІ. Перші 5 сайтів не враховуючи перші 3 із маркером "реклама",
                        оскільки вони тимчасово проплачені, і є найефективнішими у просуванні.
                        Також дуже ефективне розміщення на персональних сайтах авторитетних компаній з продажу нерухомості,
                        оскільки усі їхні клієнти, напрацьовані десятиліттями та маркетинговими капіталовкладеннями,
                        одразу стануть Вашими потенційними клієнтами.

                        Із радістю розмістимо Ваше оголошення на нашому сайті, додатково надамо персоналізований дизайн
                        продажу Вашого об'єкту.
                      </div>
                    </div>
                  </div>
                  {/* # Faq item*/}
                  <div className="accordion-item">
                    <h3 className="accordion-header">
                      <button
                        onClick={toggleFaq}
                        className="accordion-button collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#faq-content-3"
                      >
                        <span className="num">
                          <i className="bi bi-3-square" />
                        </span>
                        Наскільки вищу вартість варто ставити, якщо продаж нетерміновий?
                      </button>
                    </h3>
                    <div
                      id="faq-content-3"
                      className="accordion-collapse collapse"
                      data-bs-parent="#faqlist"
                    >
                      <div className="accordion-body">
                        Науково доведено - власникам майна завжди притаманно переоцінювати свою власність.
                        Існує часте бажання випробувати власну удачу і зіграти в лотерею із завищеною ціною нерухомості.
                        Але пам'ятайте - Ви наносите непоправимий удар по репутації власного об'єкту продажу.
                        Не секрет, що завищена вартість призведе до затримки об'єкту на ринку.
                        Хороші об'єкти продаються максимум до 1 місяця, а ті, що більше 3 місяців на ринку - вважаються
                        ПРОБЛЕМНИМИ, нецікавими, зіпсованими, із скритими недоліками.
                        Як наслідок завищена вартість більш ніж у 80% випадків призводить до продажу по ще нижчій ціні у результаті.
                        Знайте, вартість повинна бути ПРАВИЛЬНОЮ. Об'єкт повинен продаватися до 1 місяця!

                        Ми готові якісно використати наш досвід для продажу Вашого об'єкту, оскільки статистично продаємо на 5-10%
                        дорожче від ринкової вартості.
                      </div>
                    </div>
                  </div>
                  {/* # Faq item*/}
                  <div className="accordion-item">
                    <h3 className="accordion-header">
                      <button
                        onClick={toggleFaq}
                        className="accordion-button collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#faq-content-4"
                      >
                        <span className="num">
                          <i className="bi bi-4-square" />
                        </span>
                        Як вдало вибрати фахівця для продажу власної нерухомості
                      </button>
                    </h3>
                    <div
                      id="faq-content-4"
                      className="accordion-collapse collapse"
                      data-bs-parent="#faqlist"
                    >
                      <div className="accordion-body">
                        Є декілька різних способів у виборі фахівця.
                        Найбільш поширений і малоефективний довірити маловідомому агенту-одинаку,
                        яких у великому місті лише декілька тисяч.
                        Найкраще укласти угоду про продаж із авторитетною рієлторською компанією, яка має
                        штат працівників, маркетинговий відділ із фахівцями, які щоденно здійснюють рекламу,
                        представницькі офіси, веб-ресурси, принаймні професійний сайт та гідну репутацію на ринку.
                        Для цього варто перевірити агентство у сертифікованих асоціаціях на ознаки шахрайства та недобросовісності.
                        АФНУ, ЛОР інші.

                        Ми - системна компанія із багаторічним досвідом та кваліфікованими працівниками та із вдячністю
                        проявимо відповідні зусилля для продажу Вашої нерухомості задля збереження проявленої довіри.
                      </div>
                    </div>
                  </div>
                  {/* # Faq item*/}
                </div>
              </div>
            </div>
          </div>
        </section>




        {/* End Frequently Asked Questions Section */}
        {/* - - - - - - - -  Recent Blog Posts Section - - - - - - - -  */}
        <section id="recent-posts" className="recent-posts sections-bg">
          <div className="container" data-aos="fade-up">
            <div className="section-header">
              <h2>Нещодавні статті блогу</h2>
              <p>Слідкуйте за тенденціями ринку нерухомості та нашими новинками і бонусами для Вас</p>
            </div>
            <div className="row gy-4">
              <div className="col-xl-4 col-md-6">
                <article>
                  <div className="post-img">
                    <img
                      src="/land1/images/blog/blog-1.jpg"
                      alt=""
                      className="img-fluid"
                    />
                  </div>
                  <p className="post-category">Ринок нерухомості</p>
                  <h2 className="title">
                    <a href="/">
                      Наскільки суттєві ризики падіння цін на нерухомість?
                    </a>
                  </h2>
                  <div className="d-flex align-items-center">
                    <div className="post-meta">
                      <p className="post-author">Антон Агійчук</p>
                      <p className="post-date">
                        <time dateTime="2022-01-01">Жт 22, 2024</time>
                      </p>
                    </div>
                  </div>
                </article>
              </div>
              {/* End post list item */}
              <div className="col-xl-4 col-md-6">
                <article>
                  <div className="post-img">
                    <img
                      src="/land1/images/blog/blog-2.jpg"
                      alt=""
                      className="img-fluid"
                    />
                  </div>
                  <p className="post-category">Інвестиції</p>
                  <h2 className="title">
                    <a href="">
                      Чи актуальне вкладення у нерухомість як інвестиція?
                    </a>
                  </h2>
                  <div className="d-flex align-items-center">
                    <div className="post-meta">
                      <p className="post-author">Іванна Дарні</p>
                      <p className="post-date">
                        <time dateTime="2022-01-01">Вр 30, 2024</time>
                      </p>
                    </div>
                  </div>
                </article>
              </div>
              {/* End post list item */}
              <div className="col-xl-4 col-md-6">
                <article>
                  <div className="post-img">
                    <img
                      src="/land1/images/blog/blog-3.jpg"
                      alt=""
                      className="img-fluid"
                    />
                  </div>
                  <p className="post-category">Ремонт &amp; Дизайн</p>
                  <h2 className="title">
                    <a href="">
                      Які суми вкладень у ремонт та дизайн квартири?
                    </a>
                  </h2>
                  <div className="d-flex align-items-center">
                    <div className="post-meta">
                      <p className="post-author">Орест Плетецьких</p>
                      <p className="post-date">
                        <time dateTime="2022-01-01">Жт 18, 2024</time>
                      </p>
                    </div>
                  </div>
                </article>
              </div>
              {/* End post list item */}
            </div>
            {/* End recent posts list */}
          </div>
        </section>
        {/* End Recent Blog Posts Section */}
      </div>
      {/* - - - - - - - -  Footer - - - - - - - -   */}
      <footer id="footer" className="footer">
        <div className="container">
          <div className="row gy-4">
            <div className="col-lg-12 col-md-12 footer-info text-center">
              <div className="social-links d-flex mt-4 justify-content-center">
                <a href="#" className="twitter">
                  <i className="bi bi-twitter" />
                </a>
                <a href="#" className="facebook">
                  <i className="bi bi-facebook" />
                </a>
                <a href="#" className="instagram">
                  <i className="bi bi-instagram" />
                </a>
                <a href="#" className="linkedin">
                  <i className="bi bi-linkedin" />
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="container mt-4">
          <div className="copyright">
            © Copyright{" "}
            <strong>
              <span>Rentu</span>
            </strong>
            . All Rights Reserved
          </div>
          <div className="credits">
            Designed by <a href="#">ProMax Studio</a>
          </div>
        </div>
      </footer>
      <a
        href="#"
        className="scroll-top d-flex align-items-center justify-content-center"
      >
        <i className="bi bi-arrow-up-short" />
      </a>
      <div ref={refPreLoader} id="preloader" />

    </>
  )

}

export default HomeZra