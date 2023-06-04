window.addEventListener("DOMContentLoaded", function () {
    // Tabs

    let tabs = document.querySelectorAll(".tabheader__item"),
        tabsContent = document.querySelectorAll(".tabcontent"),
        tabsParent = document.querySelector(".tabheader__items");

    function hideTabContent() {
        tabsContent.forEach((item) => {
            item.classList.add("hide");
            item.classList.remove("show", "fade");
        });

        tabs.forEach((item) => {
            item.classList.remove("tabheader__item_active");
        });
    }

    function showTabContent(i = 0) {
        tabsContent[i].classList.add("show", "fade");
        tabsContent[i].classList.remove("hide");
        tabs[i].classList.add("tabheader__item_active");
    }

    hideTabContent();
    showTabContent();

    tabsParent.addEventListener("click", function (event) {
        const target = event.target;
        if (target && target.classList.contains("tabheader__item")) {
            tabs.forEach((item, i) => {
                if (target == item) {
                    hideTabContent();
                    showTabContent(i);
                }
            });
        }
    });

    // Timer

    const deadline = "2023-06-29";

    function getTimeRemaining(endtime) {
        const t = Date.parse(endtime) - Date.parse(new Date()),
            days = Math.floor(t / (1000 * 60 * 60 * 24)),
            seconds = Math.floor((t / 1000) % 60),
            minutes = Math.floor((t / 1000 / 60) % 60),
            hours = Math.floor((t / (1000 * 60 * 60)) % 24);

        return {
            total: t,
            days: days,
            hours: hours,
            minutes: minutes,
            seconds: seconds,
        };
    }

    function getZero(num) {
        if (num >= 0 && num < 10) {
            return "0" + num;
        } else {
            return num;
        }
    }

    function setClock(selector, endtime) {
        const timer = document.querySelector(selector),
            days = timer.querySelector("#days"),
            hours = timer.querySelector("#hours"),
            minutes = timer.querySelector("#minutes"),
            seconds = timer.querySelector("#seconds"),
            timeInterval = setInterval(updateClock, 1000);

        updateClock();

        function updateClock() {
            const t = getTimeRemaining(endtime);

            days.innerHTML = getZero(t.days);
            hours.innerHTML = getZero(t.hours);
            minutes.innerHTML = getZero(t.minutes);
            seconds.innerHTML = getZero(t.seconds);

            if (t.total <= 0) {
                clearInterval(timeInterval);
            }
        }
    }

    setClock(".timer", deadline);

    // Modal

    const modalTrigger = document.querySelectorAll("[data-modal]"),
        modal = document.querySelector(".modal");

    modalTrigger.forEach((btn) => {
        btn.addEventListener("click", openModal);
    });

    function closeModal() {
        modal.classList.add("hide");
        modal.classList.remove("show");
        document.body.style.overflow = "";
    }

    function openModal() {
        modal.classList.add("show");
        modal.classList.remove("hide");
        document.body.style.overflow = "hidden";
        clearInterval(modalTimerId);
    }

    modal.addEventListener("click", (e) => {
        if (e.target === modal || e.target.getAttribute("data-close") == "") {
            closeModal();
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.code === "Escape" && modal.classList.contains("show")) {
            closeModal();
        }
    });

    const modalTimerId = setTimeout(openModal, 30000);

    function showModalByScroll() {
        if (
            window.pageYOffset + document.documentElement.clientHeight >=
            document.documentElement.scrollHeight
        ) {
            openModal();
            window.removeEventListener("scroll", showModalByScroll);
        }
    }

    window.addEventListener("scroll", showModalByScroll);

    // Используем классы для создание карточек меню
    const getResource = async (url) => {
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`Could not fetch ${url}, status: ${res.status}`);
        }
        return await res.json();
    };

    getResource("http://localhost:3000/menu").then((data) => createCards(data));

    function createCards(data) {
        data.forEach(({ img, altimg, title, descr, price }) => {
            const element = document.createElement("div");
            element.classList.add("menu__item");

            element.innerHTML = `
        <img src=${img} alt=${altimg}>
        <h3 class="menu__item-subtitle">${title}</h3>
        <div class="menu__item-descr">${descr}</div>
        <div class="menu__item-divider"></div>
        <div class="menu__item-price">
            <div class="menu__item-cost">Цена:</div>
            <div class="menu__item-total"><span>${price}</span> грн/день</div>
        </div>
    `;

            document.querySelector(".menu .container").append(element);
        });
    }

    // Forms
    const forms = document.querySelectorAll("form");
    const message = {
        loading: "img/form/spinner.svg",
        success: "Спасибо! Скоро мы с вами свяжемся",
        failure: "Что-то пошло не так...",
    };

    forms.forEach((item) => {
        bindPostData(item);
    });

    const postData = async (url, data) => {
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-type": "application/json",
            },
            body: data,
        });
        return await res.json();
    };

    function bindPostData(form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault();

            let statusMessage = document.createElement("img");
            statusMessage.src = message.loading;
            statusMessage.style.cssText = `
              display: block;
              margin: 0 auto;
          `;
            form.insertAdjacentElement("afterend", statusMessage);

            const formData = new FormData(form);
            const json = JSON.stringify(Object.fromEntries(formData.entries()));

            postData("http://localhost:3000/requests", json)
                .then((data) => {
                    console.log(data);
                    showThanksModal(message.success);
                    statusMessage.remove();
                })
                .catch(() => {
                    showThanksModal(message.failure);
                })
                .finally(() => {
                    form.reset();
                });
        });
    }

    function showThanksModal(message) {
        const prevModalDialog = document.querySelector(".modal__dialog");

        prevModalDialog.classList.add("hide");
        prevModalDialog.classList.remove("show");
        openModal();

        const thanksModal = document.createElement("div");
        thanksModal.classList.add("modal__dialog");
        thanksModal.innerHTML = `
          <div class="modal__content">
              <div class="modal__close" data-close>×</div>
              <div class="modal__title">${message}</div>
          </div>
      `;
        document.querySelector(".modal").append(thanksModal);
        setTimeout(() => {
            thanksModal.remove();
            prevModalDialog.classList.add("show");
            prevModalDialog.classList.remove("hide");
            closeModal();
        }, 4000);
    }

    // calculator calories

    let flagWhatGender, finalResultWithActivity,
        activityCalc,
        genderForCheck,
        agreeForCheck = false,
        inputElementCalculator = document.querySelectorAll('.calculating__choose.calculating__choose_medium input');

    const calculating__choose_item = document.querySelectorAll(
            ".calculating__choose-item"
        ),
        height = document.querySelector("#height"),
        weight = document.querySelector("#weight"),
        age = document.querySelector("#age"),
        caloriesCalc = document.querySelector(".caloriesCalc"),
        showHoverActive = document.querySelectorAll(".showHoverActive"),
        calculating__result = document.querySelector(".calculating__result"),
        arrActivity = [
            document.querySelector(".low_activity"),
            document.querySelector(".nohigh_activity"),
            document.querySelector(".normal_activity"),
            document.querySelector(".high_activity"),
        ];

    calculating__choose_item[0].addEventListener("click", () => {
        changeColorOfGenderButton("women");
    });
    calculating__choose_item[1].addEventListener("click", () => {
        changeColorOfGenderButton("men");
    });

    inputElementCalculator.forEach(item => {
        item.addEventListener('input', () => {
            if (height.value && weight.value && age.value) {
                doCalculatingForCallories(+height.value,+weight.value,age.value,genderForCheck,activityCalc);
            } else {
                caloriesCalc.textContent = "____";
                calculating__result.classList.remove("hide");
            }
        });
    })

    function changeColorOfGenderButton(gender = "women") {
        genderForCheck = gender;
        if (height.value || weight.value || age.value) {
            if (agreeForCheck) {
                doCalculatingForCallories(+height.value,+weight.value,age.value,gender,activityCalc);
            }
        }

        if (gender === "women") {
            calculating__choose_item[0].classList.add(
                "calculating__choose-item_active2"
            );
            calculating__choose_item[1].classList.remove(
                "calculating__choose-item_active"
            );

            flagWhatGender = "women";
        } else if (gender === "men") {
            calculating__choose_item[1].classList.add(
                "calculating__choose-item_active"
            );
            calculating__choose_item[0].classList.remove(
                "calculating__choose-item_active",
                "calculating__choose-item_active2"
            );

            flagWhatGender = "men";
        }
    }

    arrActivity.forEach((item) => {
        item.addEventListener("click", (e) => {
            if (!height.value || !weight.value || !age.value) {
                caloriesCalc.textContent = "____";
                calculating__result.classList.remove("hide");
                removeHoveredButtonClasses();
                e.target.classList.add("calculating__choose-item_active");
                return;
            }
            calculateCallories(
                flagWhatGender,
                e.target.getAttribute("data-activity"),
                e.target
            );
        });
    });

    function removeHoveredButtonClasses() {
        showHoverActive.forEach((item) => {
            item.classList.remove("calculating__choose-item_active");
        });
    }

    function calculateCallories(whatGender = "women", whatActivity, target) {
        activityCalc = whatActivity;
        removeHoveredButtonClasses();
        target.classList.add("calculating__choose-item_active");
        doCalculatingForCallories(
            +height.value,
            +weight.value,
            age.value,
            whatGender,
            whatActivity
        );
    }

    function doCalculatingForCallories(height, weight, age, gender, activityX = 1.2) {
        let bmr, personHeight, personWeight, personAge;
        agreeForCheck = true;

        if (gender === "men") {
            personHeight = height;
            personWeight = weight;
            personAge = age;
            bmr =
                88.36 +
                13.4 * personWeight +
                4.8 * personHeight -
                5.7 * personAge;
        } else {
            personHeight = height;
            personWeight = weight;
            personAge = age;
            bmr =
                447.6 +
                9.2 * personWeight +
                3.1 * personHeight -
                4.3 * personAge;
        }
        
        finalResultWithActivity = Math.floor(bmr * activityX);
        caloriesCalc.textContent = `${finalResultWithActivity}`;
        calculating__result.classList.remove("hide");

        if (bmr < 0){
            caloriesCalc.textContent = "____";
        } else if (bmr > 10000){
            caloriesCalc.textContent = "____";
        }
    }

    //slider

    const slides = document.querySelectorAll(".offer__slide"),
        slider = document.querySelector(".offer__slider"),
        prev = document.querySelector(".offer__slider-prev"),
        next = document.querySelector(".offer__slider-next"),
        current = document.querySelector("#current"),
        total = document.querySelector("#total"),
        slidesWrapper = document.querySelector(".offer__slider-wrapper"),
        slidesField = document.querySelector(".offer__slider-innner"),
        width = window.getComputedStyle(slidesWrapper).width;

    let slideIndex = 1;
    let offset = 0;

    checkSlideIndex();

    slidesField.style.width = 100 * slides.length + "%";
    slidesField.style.display = `flex`;
    slidesField.style.transition = "0.5s all";
    slidesWrapper.style.overflow = `hidden`;

    slides.forEach((item) => {
        item.style.width = width;
    });

    slider.style.position = `relative`;

    const indicators = document.createElement("ol"),
        dots = [];
    indicators.classList.add("carousel-indicators");
    let cssTextForIndicators = `
        position: absolute;
        right: 0;
        bottom: 0;
        left: 0;
        z-index: 15;
        display: flex;
        justify-content: center;
        margin-right: 15%;
        margin-left: 15%;
        list-style: none;
    `;
    indicators.style.cssText = cssTextForIndicators;
    slider.append(indicators);

    for (let i = 0; i < slides.length; i++) {
        const dot = document.createElement("li");
        dot.setAttribute("data-slide-to", i + 1);
        let textForDots = `
            box-sizing: content-box;
            flex: 0 1 auto;
            width: 30px;
            height: 6px;
            margin-right: 3px;
            margin-left: 3px;
            cursor: pointer;
            background-color: #fff;
            background-clip: padding-box;
            border-top: 10px solid transparent;
            border-bottom: 10px solid transparent;
            opacity: .5;
            transition: opacity .6s ease;
        `;
        dot.style.cssText = textForDots;
        if (i == 0) {
            dot.style.opacity = 1;
        }
        indicators.append(dot);
        dots.push(dot);
    }

    function widthWithoutPixels(value) {
        return parseInt(value.replace(/\D/g, ""));
    }

    function checkSlideIndex() {
        if (slideIndex < 10) {
            total.textContent = `0${slides.length}`;
            current.textContent = `0${slideIndex}`;
        } else {
            total.textContent = slides.length;
            current.textContent = slideIndex;
        }
    }

    function transformSlides(offset) {
        slidesField.style.transform = `translateX(-${offset}px)`;
    }

    next.addEventListener("click", () => {
        if (offset == widthWithoutPixels(width) * (slides.length - 1)) {
            offset = 0;
        } else {
            offset += widthWithoutPixels(width);
        }

        transformSlides(offset);

        if (slideIndex == slides.length) {
            slideIndex = 1;
        } else {
            slideIndex++;
        }

        if (slides.length < 10) {
            current.textContent = `0${slideIndex}`;
        } else {
            current.textContent = slideIndex;
        }

        dotsFunction();
    });

    prev.addEventListener("click", () => {
        if (offset == 0) {
            offset = widthWithoutPixels(width) * (slides.length - 1);
        } else {
            offset -= widthWithoutPixels(width);
        }

        transformSlides(offset);

        if (slideIndex == 1) {
            slideIndex = slides.length;
        } else {
            slideIndex--;
        }

        if (slides.length < 10) {
            current.textContent = `0${slideIndex}`;
        } else {
            current.textContent = slideIndex;
        }

        dotsFunction();
    });

    function dotsFunction() {
        dots.forEach((dot) => (dot.style.opacity = ".5"));
        dots[slideIndex - 1].style.opacity = 1;
    }

    dots.forEach((dot) => {
        dot.addEventListener("click", (e) => {
            const slideTo = e.target.getAttribute("data-slide-to");

            slideIndex = slideTo;
            offset = widthWithoutPixels(width) * (slideTo - 1);
            transformSlides(offset);

            if (slides.length < 10) {
                current.textContent = `0${slideIndex}`;
            } else {
                current.textContent = slideIndex;
            }

            dotsFunction();
        });
    });
});


