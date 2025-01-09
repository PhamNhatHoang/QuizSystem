// Khởi tạo ứng dụng AngularJS
let app = angular.module("myApp", ["ngRoute"]);

app.config(function ($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl: "../view/trangchu.html",
        })
        // .when("/khoahoc", {
        //     templateUrl: "../view/khoahoc.html",
        // })
        // .when("/lienhe", {
        //     templateUrl: "../view/lienhe.html",
        // })
        .when("/gioithieu", {
            templateUrl: "../view/gioithieu.html",
        })
        .when("/gopy", {
            templateUrl: "../view/gopy.html",
        })
        .when("/hoidap", {
            templateUrl: "../view/hoidap.html",
        })
        .when("/dangnhap", {
            templateUrl: "../view/dangnhap.html",
        })
        .when("/dangki", {
            templateUrl: "../view/dangki.html",
        })
        .when("/quizzes", {
            templateUrl: "../view/quizzes.html",
        })
        .when("/examize", {
            templateUrl: "../view/examize.html",
        })
        .when("/result", {
            templateUrl: "../view/result.html",
        })
        .when("/changePassword", {
            templateUrl: "../view/changepassword.html",
        })
        .when("/updateinfo", {
            templateUrl: "../view/updateInfo.html",
        })
        .when("/forgotpassword", {
            templateUrl: "../view/forgotpassword.html",
        })
        .otherwise({
            templateUrl: "../view/home.html",
        });
});

// Khởi tạo biến toàn cục
app.controller("init", ($rootScope, $location) => {
    // Lấy thông tin người dùng đã lưu trước đó
    $rootScope.identity = JSON.parse(localStorage.getItem("userInfo")) || null;
    // Hỗ trợ thông báo
    $rootScope.notification = (mess, status, duration) => {
        let toast = document.createElement("div");
        toast.classList.add("toast-custom");
        toast.classList.add(status);
        toast.style.setProperty("--animation-duration", duration + "ms");
        //
        switch (status) {
            case "error":
                toast.innerHTML =
                    '<i class="icon-notificate fa-solid fa-exclamation"></i>' +
                    mess;
                break;
            case "success":
                toast.innerHTML =
                    "<i class='icon-notificate fa-regular fa-circle-check'></i>" +
                    mess;
                break;
            default:
                toast.innerHTML =
                    '<i class="icon-notificate fa-solid fa-triangle-exclamation"></i>' +
                    mess;
                break;
        }
        document.getElementById("wrapper-toast").appendChild(toast);
        setTimeout(() => {
            toast.remove();
        }, duration);
    };

    // Đăng xuất
    $rootScope.logout = () => {
        $rootScope.identity = null;
        localStorage.removeItem("userInfo");
        $location.path("/dangnhap");
    };
    // Kiểm tra người dùng đã đăng nhập chưa
    $rootScope.check_identity = () => {
        if (!$rootScope.identity) {
            $rootScope.notification("Vui lòng đăng nhập !!!", "warning", 4000);
            $location.path("/home").search("");
        }
    };
});

// Controller đăng nhập
app.controller("LoginController", ($scope, $rootScope, $http, $location) => {
    $scope.login = () => {
        if (!$scope.email || !$scope.password) {
            $rootScope.notification(
                "Vui lòng điền đầy đủ thông tin...",
                "warning", 3000
            );
            return;
        }

        $http
            .get("http://localhost:3000/students", {
                params: {
                    email: $scope.email,
                    password: $scope.password,
                },
            })
            .then(function (res) {
                if (res.data.length == 0) {
                    $rootScope.notification(
                        "Tài khoản hoặc mật khẩu không đúng",
                        "error",
                        5000
                    );
                    return;
                }

                $rootScope.notification(
                    "Hi " + res.data[0].username,
                    "success",
                    2000
                );

                $rootScope.identity = res.data[0];
                localStorage.setItem("userInfo", JSON.stringify(res.data[0]));
                $location.path("/");
            })
            .catch(function (err) {
                console.log(err);
            });
    };
});

// Controller đăng ký
app.controller("RegisterController", ($scope, $http, $rootScope, $location) => {
    $scope.register = () => {
        if ($scope.registerForm.$valid) {
            const requestData = {
                username: $scope.username,
                password: $scope.password,
                fullname: $scope.fullname,
                email: $scope.email,
                gender: $scope.gender,
                birthday: $scope.birthday
            };

            $http({
                method: "POST",
                url: "http://localhost:3000/students",
                data: requestData,
                headers: {
                    "Content-Type": "application/json",
                },
            }).then(
                (response) => {
                    $rootScope.notification(
                        "Đăng ký thành công với " + response.data.fullname,
                        "success",
                        2000
                    );
                    alert("Đăng ký thành công...");
                    $location.path("dangnhap");
                },
                (error) => {
                    alert("Đăng ký không thành công");
                    $rootScope.notification("Đăng ký thất bại ", "error", 2000);
                }
            );
        } else {
            alert("Form không hợp lệ");
            $rootScope.notification("Form không hợp lệ", "warning", 2000);
        }
    };

    $scope.validatePasswordMatch = function () {
        $scope.registerForm.confirmPassword.$setValidity(
            "passwordMismatch",
            $scope.password === $scope.confirmPassword
        );
    };
});


// Controller đổi mật khẩu
app.controller("ChangePasswordController", ($scope, $http, $rootScope) => {
    // Kiểm tra xem người dùng đã đăng nhập chưa
    $rootScope.check_identity();

    $scope.updatePassword = () => {
        if ($scope.changePasswordForm.$valid) {
            // Kiểm tra mật khẩu cũ
            $http
                .get(
                    `http://localhost:3000/students?email=${$rootScope.identity.email}&password=${$scope.password_old}`
                )
                .then((response) => {
                    if (response.data.length > 0) {
                        const requestData = {
                            ...$rootScope.identity,
                            password: $scope.password,
                        };
                        $http({
                            method: "PUT",
                            url: `http://localhost:3000/students/${$rootScope.identity.id}`,
                            data: requestData,
                            headers: {
                                "Content-Type": "application/json",
                            },
                        }).then(
                            (response) => {
                                console.log("🚀 ~ .then ~ response:", response);
                                $rootScope.notification(
                                    "Đổi mật khẩu thành công ",
                                    "success",
                                    4000
                                );
                            },
                            (error) => {
                                $rootScope.notification(
                                    "Đổi mật khẩu không thành công " + error,
                                    "warning",
                                    4000
                                );
                            }
                        );
                    } else {
                        $rootScope.notification(
                            "Mật khẩu cũ không đúng ",
                            "warning",
                            4000
                        );
                    }
                })
                .catch((error) => {
                    $rootScope.notification(
                        "Có lỗi xảy ra ..." + error,
                        "warning",
                        4000
                    );
                });
        } else {
            $rootScope.notification(
                "Vui lòng điền đầy đủ thông tin...",
                "warning",
                4000
            );
        }
    };

    $scope.validatePasswordMatch = function () {
        $scope.changePasswordForm.confirmPassword.$setValidity(
            "passwordMismatch",
            $scope.password === $scope.confirmPassword
        );
    };
});

// Controller quên mật khẩu
app.controller("ForgotPasswordController", ($scope, $http, $rootScope) => {
    $scope.getPassword = () => {
        if ($scope.forgotPasswordForm.$valid) {
            // Kiểm tra xem người dùng tồn tại trước khi lấy mật khẩu
            $http
                .get(`http://localhost:3000/students?email=${$scope.email}`)
                .then((response) => {
                    if (response.data.length > 0) {
                        $scope.passwordRelease = response.data[0].password;
                    } else {
                        $rootScope.notification(
                            "Email này chưa đăng kí",
                            "warning",
                            4000
                        );
                    }
                })
                .catch((error) => {
                    $rootScope.notification(
                        "Có lỗi xảy ra ..." + error,
                        "warning",
                        4000
                    );
                });
        } else {
            $rootScope.notification(
                "Vui lòng điền đầy đủ thông tin...",
                "warning",
                4000
            );
        }
    };
});

// Controller trắc nghiệm
app.controller("QuizzesController", ($scope, $http) => {
    $http
        .get("http://localhost:3000/subjects")
        .then((response) => {
            $scope.data = response.data;
        })
        .catch((error) => {
            console.error("Error loading data:", error);
        });
});

// Controller khóa học
app.controller("CoursesController", ($scope, $http) => {
    $http
        .get("http://localhost:3000/subjects")
        .then((response) => {
            $scope.data = response.data;
        })
        .catch((error) => {
            console.error("Error loading data:", error);
        });
});

// Controller làm bài thi
app.controller(
    "ExamizeController",
    ($scope, $routeParams, $http, $rootScope, $location) => {
        // Khởi tạo biến
        $scope.id_exam = $routeParams.id;
        $scope.index_question_current = 0;
        $scope.option_user_list = [];
        $scope.score = 0;
        $scope.time_remaining = 15 * 60;

        const timerInterval = setInterval(() => {
            $scope.time_remaining--; // Giảm thời gian còn lại mỗi giây

            // Chuyển đổi thời gian còn lại thành định dạng phút và giây
            $scope.formatted_time_remaining = formatTime($scope.time_remaining);

            if ($scope.time_remaining <= 0) {
                clearInterval(timerInterval); // Dừng đếm thời gian nếu hết giờ
                // Lưu kết quả
                $scope.save_result();
            }

            $scope.$apply(); // Cập nhật giao diện người dùng
        }, 1000);

        // Lấy tất cả câu hỏi
        $http
            .get(`http://localhost:3000/${$routeParams.id}`)
            .then((response) => {
                $scope.quizzes = response.data;
                console.log("🚀 ~ .then ~ $scope.quizzes:", $scope.quizzes);
            })
            .catch((error) => {
                console.error("Error loading data:", error);
            });

        // Xử lý khi click vào câu hỏi tiếp theo
        $scope.nextQuestion = () => {
            $scope.index_question_current++;
            // Nếu index câu hỏi lớn hơn số lượng câu hỏi
            // thì set lại về câu hỏi thứ 1
            if ($scope.index_question_current > $scope.quizzes.length - 1) {
                $scope.index_question_current = 0;
            }
        };

        $scope.prevQuestion = () => {
            $scope.index_question_current--;
            // Nếu index câu hỏi nhỏ hơn 0
            // set index = câu hỏi cuối của question
            if ($scope.index_question_current < 0) {
                $scope.index_question_current = $scope.quizzes.length - 1;
            }
        };

        $scope.firstQuestion = () => {
            $scope.index_question_current = 0;
        };

        $scope.lastQuestion = () => {
            $scope.index_question_current = $scope.quizzes.length - 1;
        };

        // Kiểm tra câu trả lời của người dùng
        $scope.save_result = () => {
            if (!$rootScope.identity || !$rootScope.identity.id) {
                $rootScope.notification(
                    "Vui lòng đăng nhập để lưu kết quả này.",
                    "error",
                    5000
                );
                return;
            }
            $http({
                method: "POST",
                url: "http://localhost:3000/results",
                data: {
                    answer_user: $scope.option_user_list,
                    exam_id: $routeParams.id,
                    user_id: $rootScope.identity.id,
                    score: $scope.score,
                    createAt: new Date(),
                },
                headers: {
                    "Content-Type": "application/json",
                },
            }).then(
                (response) => {
                    $rootScope.notification(
                        "Lưu kết quả thành công.",
                        "success",
                        5000
                    );

                    $location.path("/result").search({ id: $scope.id_exam });
                },
                (error) => {
                    $rootScope.notification(
                        "Lưu kết quả không thành công." + error,
                        "error",
                        3000
                    );
                }
            );
        };

        // Xử lý khi người dùng chọn câu trả lời
        $scope.selectAnswer = function (btn_select) {
            // Lấy đáp án đúng của câu hỏi
            let correctAnswer =
                $scope.quizzes[$scope.index_question_current].AnswerId;

            $scope.option_user_list[$scope.index_question_current] =
                +btn_select.srcElement.dataset.id;

            if (correctAnswer == btn_select.srcElement.dataset.id) {
                $scope.score++;
            }
        };

        let formatTime = (seconds) => {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            return `${minutes}:${remainingSeconds < 10 ? "0" : ""
                }${remainingSeconds}`;
        };
    }
);

// Controller kết quả bài thi
app.controller(
    "ResultController",
    ($scope, $http, $routeParams, $rootScope) => {
        // Kiểm tra xem người dùng đã đăng nhập chưa
        $rootScope.check_identity();

        let id_exam = $routeParams.id;
        let id_result = $routeParams.id_result;

        // Lấy tất cả câu hỏi
        $http
            .get(`http://localhost:3000/${id_exam}`)
            .then((response) => {
                $scope.questions = response.data;
                console.log("🚀 ~ .then ~ $scope.questions:", $scope.questions);
                // Tính toán điểm cao nhất của bài thi này
                $scope.maxScore = $scope.questions.reduce(
                    (total, item) => (total += item.Marks),
                    0
                );
                console.log($scope.maxScore);
            })
            .catch((error) => {
                console.error("Error loading data:", error);
            });

        // Lấy kết quả bài thi của người dùng
        let route_result = `http://localhost:3000/results?exam_id=${id_exam}&user_id=${$rootScope.identity.id}`;
        if (id_result) route_result += `&id=${id_result}`;

        $http
            .get(route_result)
            .then((response) => {
                $scope.user_choses = response.data[response.data.length - 1];
            })
            .catch((error) => {
                console.error("Error loading data:", error);
            });
    }
);

// Controller cập nhật thông tin
app.controller("UpdateInfoController", ($scope, $rootScope, $http) => {
    $scope.infoUser = $rootScope.identity;

    $scope.updateInfo = (event) => {
        event.preventDefault();
        if ($scope.updateInfoForm.$valid) {
            $http({
                method: "PUT",
                url: `http://localhost:3000/students/${$scope.infoUser.id}`,
                data: $scope.infoUser,
                headers: {
                    "Content-Type": "application/json",
                },
            })
                .then(
                    (response) => {
                        alert("Cập nhật thành công ...");

                        $rootScope.identity = response.data;
                        $scope.infoUser = response.data;
                        localStorage.setItem(
                            "userInfo",
                            JSON.stringify(response.data)
                        );
                    },
                    (error) => {
                        alert("Cập nhật không thành công ...");
                    }
                )
                .catch((error) => {
                    $rootScope.notification(
                        "Có lỗi xảy ra ..." + error,
                        "warning",
                        4000
                    );
                });
        } else {
            $rootScope.notification(
                "Vui lòng điền đầy đủ thông tin...",
                "warning",
                4000
            );
        }
    };
});
