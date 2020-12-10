window.onload = setUp;

let container;
let database;
let email_login;
let email_registration;
let password_login;
let password_registration;
let name;
let lastname;
let txtDisplayName;
let txtEmailDisabled;
let btnSaveStudent;
let txtDisplayName_professor;
let txtEmailDisabled_professor;
let btnSaveProfessor;


function setUp() {
    email_registration = document.getElementById("email_registration");
    password_registration = document.getElementById("password_registration");
    email_login = document.getElementById("email_login");
    password_login = document.getElementById("password_login");
    name = document.getElementById("name");
    lastname = document.getElementById("lastname");
    txtDisplayName = document.getElementById("txtDisplayName");
    txtEmailDisabled = document.getElementById("txtEmailDisabled");
    btnSaveStudent = document.getElementById("btnSaveStudent");
    txtDisplayName_professor = document.getElementById("txtDisplayName_professor");
    txtEmailDisabled_professor = document.getElementById("txtEmailDisabled_professor");
    btnSaveProfessor = document.getElementById("btnSaveProfessor");
    document.getElementById("logIn").addEventListener("click", login);
    document.getElementById("reg").addEventListener("click", registracija);

    let btnRegistracija = document.getElementById("registracija");
    let btnSignOut = document.getElementById("signout");

    btnRegistracija.addEventListener("click", registration);
    btnSignOut.addEventListener("click", signOut);
    btnSaveStudent.addEventListener("click", saveStudent);
    btnSaveProfessor.addEventListener("click", saveProfessor);


    container = document.getElementById('container');

    database = firebase.database();

    checkActiveUser();
}

function registracija() {
    window.location = "#treca";

    database.ref("subjects").once("value")
        .then(function (snapshot) {
            let listSubjects = snapshot.val();
            let sklopiviPrvi = document.getElementById('sklopiviPrvi');
            sklopiviPrvi.innerHTML = '';
            for (let key in listSubjects) {
                if (listSubjects[key]) {
                    let br = document.createElement("br");
                    let checkbox = document.createElement("input");
                    checkbox.setAttribute("type", "checkbox");
                    checkbox.setAttribute("uid", key);
                    checkbox.id = key;
                    let content = document.createTextNode(listSubjects[key].name);
                    sklopiviPrvi.appendChild(br);
                    sklopiviPrvi.appendChild(checkbox);
                    sklopiviPrvi.appendChild(content);
                }
            };
        })
        .catch(function (err) {
            console.error(err);
        });
}

function registration() {
    firebase.auth().createUserWithEmailAndPassword(email_registration.value, password_registration.value)
        .then(function (credentials) {
            subjects = [];
            let elements = document.querySelectorAll("#sklopiviPrvi>input");
            elements.forEach(function (element) {
                if (element.checked) {
                    subjects.push(element.id);
                }
            })
            addStudentToDatabase(credentials, {
                "email": credentials.user.email,
                "displayName": `${name} ${lastname}`,
                "subjects": subjects
            });
            updateUser(credentials, {
                displayName: `${name} ${lastname}`
            });
        })
        .catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            if (errorCode == 'auth/weak-password') {
                alert('The password is too weak.');
            } else {
                alert(errorMessage);
            }
            console.error(error);
        });
}

function login() {
    SignIn();
}

function makeTable() {
    let tableContainer = document.createElement("div");
    let table = document.createElement('table');
    table.setAttribute("border", 1);
    let columns = [
        document.createElement('tr')
    ];
    let days = ["Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak"];
    for (let j = -1; j < 5; j++) {
        let cell = document.createElement('th');
        cell.innerHTML = days[j]
        columns[0].appendChild(cell);
        table.appendChild(columns[0]);
    }
    for (let i = 0; i < 12; i++) {
        let column = document.createElement('tr');
        column.id = `column-${8+i}`;
        columns.push(column);
        table.appendChild(column);
        let cell = document.createElement('th');
        cell.innerHTML = `${8+i}-${9+i}`;
        column.appendChild(cell);
        for (let j = 0; j < 5; j++) {
            let cell = document.createElement('td');
            column.appendChild(cell);
        }
    }
    tableContainer.id ="tableContainer";
    tableContainer.appendChild(table);
    container.appendChild(tableContainer);
}

function clearCointainer() {
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
}

function checkActiveUser() {
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            window.location = "#container";
            makeTable();
            let user = firebase.auth().currentUser;
            let name, email, photoUrl, uid, emailVerified;

            if (user != null) {
                email = user.email;
                uid = user.uid;
                console.log(`user: ${email}\nuid:${uid}`);
                generateContent(uid);
            }
        } else {
            window.location = "#prva";
        }
    });
}

function SignIn() {
    firebase.auth().signInWithEmailAndPassword(email_login.value, password_login.value)
        .then(function (res) {
            checkActiveUser();
        })
        .catch(function (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            if (errorCode === 'auth/wrong-password') {
                alert('Wrong password.');
            } else {
                alert(errorMessage);
            }
            console.error(error);
        });
}

function signOut() {
    firebase.auth().signOut();
}

function addStudentToDatabase(credentials, properties) {
    database.ref().child(`students/${credentials.user.uid}`).set(properties)
        .then(function (res) {
            console.log(res);
        })
        .catch(function (err) {
            console.error(err);
        });
}

function updateUser(user, object) {
    if (user.user) user = user.user;
    user.updateProfile(object).then(function () {
        console.log("User successfuly updated!")
    }).catch(function (error) {
        console.error(error);
    });
}

function generateContent(uid) {
    database.ref("professors").once("value")
        .then(function (snapshot) {
            let listaProfesori = snapshot.val();
            if (listaProfesori[uid]) {
                generateProfessorContent(uid);
            } else {
                generateStudentContent(uid);
            }
        })
        .catch(function (err) {
            console.error(err);
        });
}

function generateProfessorContent(uid) {
    let professorsRef = database.ref("professors");
    professorsRef.once("value")
        .then(function (snapshot) {
            let professor = snapshot.val()[uid];
            clearCointainer();

            let infoLabel = document.createElement("p");
            infoLabel.innerHTML = `Prijavljeni ste kao: ${professor.email}`;
            container.appendChild(infoLabel);

            let subjectsElement = document.createElement("p");
            subjectsElement.id = "subjectsElement";
            container.appendChild(subjectsElement);

            //load data
            getAllSubjects(function (snapshot2) {
                snapshot2 = snapshot2.val();
                for (let i in professor.subjects) {
                    let uid = professor.subjects[i];
                    subjectsElement.innerHTML += `Kolegij: ${snapshot2[uid].name}, Tip: ${snapshot2[uid].type}, Vrijeme: ${snapshot2[uid].beginning}-${snapshot2[uid].end}, dan: ${snapshot2[uid].day}<br>`;
                }

            })


            let signOutButton = document.createElement("button");
            let editButton = document.createElement("button");

            signOutButton.innerHTML = "Sign out";
            editButton.innerHTML = "Edit";

            signOutButton.addEventListener("click", signOut);
            editButton.addEventListener("click", editProfessor);

            container.appendChild(signOutButton);
            container.appendChild(editButton);

        })
        .catch(function (err) {
            console.error(err);
        });
}

function generateStudentContent(uid) {
    let studentsRef = database.ref("students");
    studentsRef.once("value")
        .then(function (snapshot) {
            let student = snapshot.val()[uid];
            clearCointainer();

            let infoLabel = document.createElement("p");
            infoLabel.innerHTML = `Prijavljeni ste kao: ${student.email}`;
            container.appendChild(infoLabel);

            let conflictsElement = document.createElement("p");
            conflictsElement.id = "conflictsElement";
            container.appendChild(conflictsElement);

            makeTable();
            loadDataToTable(student.subjects);

            let signOutButton = document.createElement("button");
            let editButton = document.createElement("button");

            signOutButton.innerHTML = "Sign out";
            editButton.innerHTML = "Edit";

            signOutButton.addEventListener("click", signOut);
            editButton.addEventListener("click", editStudent);

            container.appendChild(signOutButton);
            container.appendChild(editButton);
        })
        .catch(function (err) {
            console.error(err);
        });
}

function clearTable() {
    let td = document.getElementsByTagName("td");
    for (let element of td) {
        element.innerHTML = "";
    }
}

function loadDataToTable(studentSubjects) {
    if (studentSubjects === undefined) return;
    clearTable();
    let conflictsElement = document.getElementById("conflictsElement");
    conflictsElement.innerHTML = "";
    let subjectsRef = database.ref("subjects");
    let subjects = [];
    subjectsRef.once("value")
        .then(function (snapshot) {
            let allSubjects = snapshot.val();
            for (let key in studentSubjects) {
                if (allSubjects[studentSubjects[key]]) {
                    let element = allSubjects[studentSubjects[key]];
                    element.uid = studentSubjects[key];
                    subjects.push(element);
                }
            }
            let times = {};
            let times_copy = {};
            let conflicts = {};
            //check conflicts
            for (let element of subjects) {
                if (!times[element.day]) {
                    times[element.day] = [];
                    times[element.day].push(element);
                    times_copy[element.day] = [];
                    times_copy[element.day].push(element);
                } else {
                    let flag = false;
                    for (let time in times[element.day]) {
                        time = times[element.day][time];
                        if (element.beginning < time.beginning && element.end > time.end ||
                            element.beginning > time.beginning && element.end < time.end ||
                            element.beginning < time.beginning && element.end > time.beginning ||
                            element.beginning < time.end && element.end > time.end) {
                            flag = true;
                            if (conflicts[element.day])
                                conflicts[element.day].push([element, time]); //add to conflicts so you can print it
                            else {
                                conflicts[element.day] = [];
                                conflicts[element.day].push([element, time]);
                            }
                            if (times_copy[element.day].indexOf(time) != -1)
                                times_copy[element.day].splice(times_copy[element.day].indexOf(time), 1);
                        }
                    }
                    if (!flag) {
                        times[element.day].push(element);
                        times_copy[element.day].push(element);
                    }
                    times = times_copy;
                }
                console.log(times);
            }
            //add to table
            let times_copy2 = times;
            times = []
            for (let i in times_copy2) {
                if (times_copy2[i]) {
                    for (let subject of times_copy2[i]) {
                        times.push(subject);
                    }
                }
            }

            for (let element in times) {
                let columns = [];
                for (let i = times[element].beginning; i < times[element].end; i++) {
                    columns.push(document.getElementById(`column-${i}`));
                }
                for (let column of columns) {
                    let cell = document.querySelectorAll(`#${column.id}>td`)
                    cell = cell.item(times[element].day);
                    database.ref(`professors/${times[element].professor}`).once("value")
                        .then(function(snap){
                            snap = snap.val();
                            cell.innerHTML = `${times[element].name}<br>${snap.displayName}<br>${times[element].type}`;
                        })
                }
            }
            for (let i in conflicts) {
                conflictsElement.innerHTML += `day: ${i} - ${JSON.stringify(conflicts[i])}<br>`
            }
        })
        .catch(function (err) {
            console.error(err);
        });
}

function getAllSubjects(callback) {
    let subjectsRef = database.ref("subjects");
    subjectsRef.once("value")
        .then(callback)
        .catch(function (err) {
            console.error(err);
        })
}

function getAllProfessors(callback) {
    let professorsRef = database.ref("professors");
    professorsRef.once("value")
        .then(callback)
        .catch(function (err) {
            console.error(err);
        })
}

function getAllStudents(callback) {
    let studentsRef = database.ref("students");
    studentsRef.once("value")
        .then(callback)
        .catch(function (err) {
            console.error(err);
        })
}

function getUsersSubjects(callback) {
    let user = firebase.auth().currentUser;
    let studentRef = database.ref(`students/${user.uid}/subjects`);
    let usersSubjects = {};
    studentRef.once("value")
        .then(function (snapshot1) {
            snapshot1 = snapshot1.val();
            getAllSubjects(function (snapshot2) {
                snapshot2 = snapshot2.val();
                for (let subject in subjects2) {
                    if (snapshot1[subject]) {
                        usersSubjects[subject] = snapshot1[subject];
                        usersSubjects[subject].uid = subject;
                    }
                }
                callback(usersSubjects);
            });
        })
        .catch(function (err) {
            console.error(err);
        });
}

function editStudent() {
    window.location = "#editStudent";
    let user = firebase.auth().currentUser;
    let studentRef = database.ref(`students/${user.uid}`);
    studentRef.once("value")
        .then(function (snapshot) {
            snapshot = snapshot.val();
            txtEmailDisabled.value = snapshot.email;
            txtDisplayName.value = snapshot.displayName ;//? snapshot.displayName : user.displayName;

            getAllSubjects(function (snapshot2) {
                snapshot2 = snapshot2.val();
                let sklopiviDrugi = document.getElementById('sklopiviDrugi');
                sklopiviDrugi.innerHTML = '';
                for (let key in snapshot2) {
                    let br = document.createElement("br");
                    let checkbox = document.createElement("input");
                    checkbox.setAttribute("type", "checkbox");
                    checkbox.setAttribute("uid", key)
                    checkbox.id = key;
                    let content = document.createTextNode(snapshot2[key].name);
                    sklopiviDrugi.appendChild(br);
                    sklopiviDrugi.appendChild(checkbox);
                    sklopiviDrugi.appendChild(content);
                    if (snapshot2[key]) {
                        if (snapshot.subjects)
                            checkbox.checked = snapshot.subjects.indexOf(key) > -1 ? true : false;
                    }
                };
            });
        })
        .catch(function (err) {
            console.error(err);
        });
}

function saveStudent() {
    // added because of ghost bug
    txtDisplayName = document.getElementById("txtDisplayName");
    let user = firebase.auth().currentUser;
    updateUser(user, {
        displayName: txtDisplayName.value
    });
    let usersDisplayNameRef = database.ref(`students/${user.uid}/displayName`);
    usersDisplayNameRef.set(txtDisplayName.value);
    let usersSubjectsRef = database.ref(`students/${user.uid}/subjects`);
    let selectedSubjects = document.querySelectorAll("#sklopiviDrugi>input");
    let selectedSubjectsArray = [];
    selectedSubjects.forEach(function (element) {
        if (element.checked)
            selectedSubjectsArray.push(element.getAttribute("uid"));
    });
    usersSubjectsRef.set(selectedSubjectsArray)
        .then(function (snapshot) {
            usersSubjectsRef.once("value")
                .then(function (snapshot) {
                    loadDataToTable(snapshot.val());
                }).catch(function (err) {
                    console.error(err);
                })
        }).catch(function (err) {
            console.error(err);
        });
    window.location = "#container";
}

function editProfessor() {
    window.location = "#editProfessor";

    let user = firebase.auth().currentUser;
    let professorRef = database.ref(`professors/${user.uid}`);
    professorRef.once("value")
        .then(function (snapshot) {
            snapshot = snapshot.val();
            txtEmailDisabled_professor.value = snapshot.email;
            txtDisplayName_professor.value = snapshot.displayName ;//? snapshot.displayName : user.displayName;

            getAllSubjects(function (snapshot2) {
                snapshot2 = snapshot2.val();
                let sklopiviTreci = document.getElementById('sklopiviTreci');
                sklopiviTreci.innerHTML = '';
                for (let key in snapshot2) {
                    if (snapshot2[key]) {
                        if (snapshot.subjects) {
                            let div = document.createElement("div");
                            let input = document.createElement("input");
                            let selectBeginning = document.createElement("select");
                            let selectEnd = document.createElement("select");
                            let selectDay = document.createElement("select");
                            let button = document.createElement("button");
                            let contentinput = document.createTextNode("Kolegij: ");
                            let contentBeginning = document.createTextNode("Početak: ");
                            let contentEnd = document.createTextNode("Kraj: ");
                            let contentDay = document.createTextNode("Dan: ");

                            let days = ["Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak"];

                            for (let i = 8; i < 21; i++) {
                                let option = document.createElement("option");
                                option.value = i;
                                option.innerHTML = i;
                                selectBeginning.appendChild(option);
                            }
                            for (let i = 9; i <= 21; i++) {
                                let option = document.createElement("option");
                                option.value = i;
                                option.innerHTML = i;
                                selectEnd.appendChild(option);
                            }
                            for (let i = 0; i < 5; i++) {
                                let option = document.createElement("option");
                                option.value = i;
                                option.innerHTML = days[i];
                                selectDay.appendChild(option);
                            }

                            div.id = key;
                            input.value = snapshot2[key].name;
                            selectBeginning.value = snapshot2[key].beginning;
                            selectEnd.value = snapshot2[key].end;
                            selectDay.value = snapshot2[key].day;
                            button.innerHTML = "Ukloni"; // add event to remove and add

                            button.addEventListener("click", function () {
                                sklopiviTreci.removeChild(div);
                                removeSubjectProfessor(div.id);
                            })

                            div.appendChild(contentinput);
                            div.appendChild(input);
                            div.appendChild(contentBeginning);
                            div.appendChild(selectBeginning);
                            div.appendChild(contentEnd);
                            div.appendChild(selectEnd);
                            div.appendChild(contentDay);
                            div.appendChild(selectDay);
                            div.appendChild(button);

                            sklopiviTreci.appendChild(div);
                        }
                    }
                };
                let addButton = document.createElement("button");
                addButton.innerHTML = "Dodaj novi"
                sklopiviTreci.appendChild(addButton);
                addButton.addEventListener("click", function () {
                    let key = database.ref("subjects").push().then(function (uid) {
                        uid = uid.key;

                        let div = document.createElement("div");
                        let input = document.createElement("input");
                        let selectBeginning = document.createElement("select");
                        let selectEnd = document.createElement("select");
                        let selectDay = document.createElement("select");
                        let button = document.createElement("button");
                        let contentinput = document.createTextNode("Kolegij: ");
                        let contentBeginning = document.createTextNode("Početak: ");
                        let contentEnd = document.createTextNode("Kraj: ");
                        let contentDay = document.createTextNode("Dan: ");

                        let days = ["Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak"];

                        for (let i = 8; i < 21; i++) {
                            let option = document.createElement("option");
                            option.value = i;
                            option.innerHTML = i;
                            selectBeginning.appendChild(option);
                        }
                        for (let i = 9; i <= 21; i++) {
                            let option = document.createElement("option");
                            option.value = i;
                            option.innerHTML = i;
                            selectEnd.appendChild(option);
                        }
                        for (let i = 0; i < 5; i++) {
                            let option = document.createElement("option");
                            option.value = i;
                            option.innerHTML = days[i];
                            selectDay.appendChild(option);
                        }

                        div.id = uid;
                        selectBeginning.value = 8;
                        selectEnd.value = 9;
                        selectDay.value = 0;
                        button.innerHTML = "Ukloni"; // add event to remove and add

                        button.addEventListener("click", function () {
                            container.removeChild(div);
                            removeSubjectProfessor(div.id)
                        })

                        div.appendChild(contentinput);
                        div.appendChild(input);
                        div.appendChild(contentBeginning);
                        div.appendChild(selectBeginning);
                        div.appendChild(contentEnd);
                        div.appendChild(selectEnd);
                        div.appendChild(contentDay);
                        div.appendChild(selectDay);
                        div.appendChild(button);

                        sklopiviTreci.insertBefore(div, sklopiviTreci.childNodes[sklopiviTreci.childNodes.length - 1]);
                    });

                });

            });
        })
        .catch(function (err) {
            console.error(err);
        });
}

function saveProfessor() {
    // added because of ghost bug
    txtDisplayName_professor = document.getElementById("txtDisplayName_professor");
    let user = firebase.auth().currentUser;
    updateUser(user, {
        displayName: txtDisplayName_professor.value
    });
    let usersDisplayNameRef = database.ref(`professors/${user.uid}/displayName`);
    usersDisplayNameRef.set(txtDisplayName_professor.value);

    let usersSubjectsRef = database.ref(`professors/${user.uid}/subjects`);
    let subjectsRef = database.ref(`subjects`);
    let selectedSubjects = document.querySelectorAll("#sklopiviTreci>div");
    let selectedSubjectsArray = [];
    let subjects = {};
    selectedSubjects.forEach(function (element) {
        selectedSubjectsArray.push(element.getAttribute("id"));
        subjects[element.id] = {
            beginning: +element.querySelectorAll("select").item(0).value,
            end: +element.querySelectorAll("select").item(1).value,
            day: +element.querySelectorAll("select").item(2).value,
            type: "Predavanja",
            name: element.querySelectorAll("input").item(0).value,
            professor: user.uid
        }
    });

    for (let key in subjects) {
        database.ref(`subjects/${key}`).set(subjects[key]);
    }

    usersSubjectsRef.set(selectedSubjectsArray)
        .then(function (snapshot) {
            usersSubjectsRef.once("value")
                .then(function (snapshot) {
                    clearCointainer();
                    generateProfessorContent(user.uid);
                    window.location = "#container";
                }).catch(function (err) {
                    console.error(err);
                })
        }).catch(function (err) {
            console.error(err);
        });

}

function removeSubjectProfessor(uid) {
    let subjectsRef = database.ref(`subjects/${uid}`);
    subjectsRef.remove();
    let professorRef = database.ref(`professors/subjects/${uid}`);
    professorRef.remove();
    let students = {};
    let studentsRef = database.ref(`students`);
    studentsRef.once("value")
        .then(function (snapshot) {
            snapshot = snapshot.val();
            for (let i in snapshot) {
                if (snapshot[i].subjects){
                    let removeRef = database.ref(`students/${i}/subjects/${uid}`);
                    removeRef.remove();
                }
            }
        })
        .catch(function (err) {
            console.error(err);
        });
}

// TODO:
// - Comment everything