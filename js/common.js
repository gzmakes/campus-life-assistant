(function () {
    document.addEventListener("DOMContentLoaded", function () {
        updateNavActions();
        initMobileNavigation();
        initSiteLikeButton();
        bindLogoutButton();
        initProfileForm();
        initProfileSecurityActions();
        initCampusPetAssistant();
    });

    function initMobileNavigation() {
        var navbar = document.querySelector(".navbar");
        var toggle = document.querySelector(".nav-toggle");
        var links = document.getElementById("primary-navigation");
        if (!navbar || !toggle || !links) {
            return;
        }

        navbar.classList.add("mobile-nav-ready");

        function closeMenu() {
            navbar.classList.remove("is-nav-open");
            toggle.setAttribute("aria-expanded", "false");
            toggle.setAttribute("aria-label", "打开主导航");
        }

        toggle.addEventListener("click", function () {
            var opening = toggle.getAttribute("aria-expanded") !== "true";
            navbar.classList.toggle("is-nav-open", opening);
            toggle.setAttribute("aria-expanded", opening ? "true" : "false");
            toggle.setAttribute("aria-label", opening ? "关闭主导航" : "打开主导航");
        });

        links.addEventListener("click", function (event) {
            if (event.target.closest("a")) {
                closeMenu();
            }
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape") {
                closeMenu();
            }
        });

        document.addEventListener("click", function (event) {
            if (!navbar.contains(event.target)) {
                closeMenu();
            }
        });

        window.addEventListener("resize", function () {
            if (window.innerWidth > 780) {
                closeMenu();
            }
        });
    }

    var DEFAULT_PROFILE = {
        name: "校园生活助手用户",
        nickname: "校园生活助手用户",
        studentId: "20250001",
        phone: "",
        gender: "男",
        college: "数据科学与人工智能学院",
        role: "学生",
        status: "在校学生",
        avatar: "images/vercel-assets/asset-002.png"
    };

    function updateNavActions() {
        var navActions = document.querySelector(".nav-actions");
        if (!navActions) {
            return;
        }

        var user = readCurrentUser();
        if (!user) {
            return;
        }

        navActions.textContent = "";
        var avatarLink = document.createElement("a");
        avatarLink.className = "avatar-link";
        avatarLink.href = "profile.html";
        avatarLink.setAttribute("aria-label", "进入个人中心");
        avatarLink.title = "个人中心";

        var avatarImage = document.createElement("img");
        avatarImage.className = "nav-avatar";
        avatarImage.src = getProfileAvatar(user);
        avatarImage.alt = "个人中心";
        avatarLink.appendChild(avatarImage);
        navActions.appendChild(avatarLink);
        initSiteLikeButton();
    }

    function initSiteLikeButton() {
        var header = document.querySelector(".site-header");
        if (!header) {
            return;
        }

        var button = header.querySelector("[data-site-like]");
        if (!button) {
            button = document.createElement("button");
            button.className = "site-like-button";
            button.type = "button";
            button.setAttribute("data-site-like", "true");
            button.setAttribute("aria-label", "给江财现经管校园生活助手点赞或取消点赞");
            button.innerHTML =
                '<svg class="site-like-icon" viewBox="0 0 24 24" aria-hidden="true">' +
                    '<path d="M7.2 21H5.1A2.1 2.1 0 0 1 3 18.9v-7.1a2.1 2.1 0 0 1 2.1-2.1h2.1V21Zm3.1 0a2.4 2.4 0 0 1-2.4-2.4v-7.1c0-.5.2-1 .5-1.4l4.7-6.8c.4-.6 1.1-.9 1.8-.7 1.1.2 1.8 1.2 1.6 2.3l-.7 4h3.1a2.8 2.8 0 0 1 2.7 3.4l-1.4 6.4A3 3 0 0 1 17.3 21h-7Z"/>' +
                '</svg>' +
                '<span class="site-like-count">0</span>';
            button.addEventListener("click", handleSiteLikeClick);
            header.appendChild(button);
        }

        updateSiteLikeButton(button);
    }

    function handleSiteLikeClick() {
        var liked = localStorage.getItem("campusSiteLiked") === "true";
        var count = readSiteLikeCount();

        if (liked) {
            count = Math.max(0, count - 1);
            localStorage.setItem("campusSiteLiked", "false");
        } else {
            count += 1;
            localStorage.setItem("campusSiteLiked", "true");
        }

        localStorage.setItem("campusSiteLikeCount", String(count));
        updateSiteLikeButton(this);
    }

    function updateSiteLikeButton(button) {
        if (!button) {
            return;
        }

        var count = readSiteLikeCount();
        var liked = localStorage.getItem("campusSiteLiked") === "true";
        var countTarget = button.querySelector(".site-like-count");
        if (countTarget) {
            countTarget.textContent = String(count);
        }
        button.classList.toggle("is-liked", liked);
        button.title = liked ? "已点赞，点击取消点赞" : "给校园生活助手点赞";
        button.setAttribute("aria-pressed", liked ? "true" : "false");
    }

    function readSiteLikeCount() {
        var raw = parseInt(localStorage.getItem("campusSiteLikeCount") || "0", 10);
        return Number.isFinite(raw) && raw > 0 ? raw : 0;
    }

    function bindLogoutButton() {
        var logoutButton = document.getElementById("logoutButton");
        if (!logoutButton) {
            return;
        }

        logoutButton.addEventListener("click", function () {
            clearLoginState();
            window.location.href = "login.html";
        });
    }

    function initProfileForm() {
        var form = document.getElementById("profileForm");
        if (!form) {
            return;
        }

        var user = normalizeUser(readCurrentUser());
        fillProfileForm(user);
        updateProfileAvatar(user);
        updateProfileSummary(user);

        bindProfileRoleStatus(user);
        bindProfileAvatarUpload(function (updatedUser) {
            user = updatedUser;
            updateProfileAvatar(updatedUser);
            updateProfileSummary(updatedUser);
            updateNavActions();
        });

        form.addEventListener("submit", function (event) {
            event.preventDefault();

            var updatedUser = collectProfileForm(user);
            saveCurrentUser(updatedUser);
            user = updatedUser;
            updateProfileAvatar(updatedUser);
            updateProfileSummary(updatedUser);
            updateNavActions();
            showProfileMessage("资料已保存。", "success");
        });
    }

    function fillProfileForm(user) {
        setInputValue("profileNickname", user.nickname || user.name);
        setInputValue("profileStudentId", user.studentId || user.username);
        setInputValue("profilePhone", user.phone || user.mobile);
        setRadioValue("gender", user.gender);
        setInputValue("profileCollege", user.college);
        setInputValue("profileRole", user.role);
        syncProfileStatusOptions(user.role, user.status);
    }

    function collectProfileForm(oldUser) {
        var nickname = getInputValue("profileNickname") || DEFAULT_PROFILE.nickname;

        var updatedUser = Object.assign({}, oldUser, {
            name: nickname,
            nickname: nickname,
            studentId: getInputValue("profileStudentId") || DEFAULT_PROFILE.studentId,
            username: getInputValue("profileStudentId") || oldUser.username || DEFAULT_PROFILE.studentId,
            phone: getInputValue("profilePhone"),
            gender: getRadioValue("gender") || DEFAULT_PROFILE.gender,
            college: getInputValue("profileCollege") || DEFAULT_PROFILE.college,
            role: normalizeRole(getInputValue("profileRole") || DEFAULT_PROFILE.role),
            status: getProfileStatus(getInputValue("profileRole")),
            updatedAt: new Date().toISOString()
        });

        return updatedUser;
    }

    function normalizeUser(user) {
        var normalized = Object.assign({}, DEFAULT_PROFILE, user || {});
        normalized.nickname = normalized.nickname || normalized.name || DEFAULT_PROFILE.nickname;
        normalized.name = normalized.nickname;
        normalized.studentId = normalized.studentId || normalized.username || DEFAULT_PROFILE.studentId;
        normalized.username = normalized.username || normalized.studentId;
        normalized.phone = normalized.phone || normalized.mobile || DEFAULT_PROFILE.phone;
        normalized.gender = normalized.gender || DEFAULT_PROFILE.gender;
        normalized.college = normalized.college || DEFAULT_PROFILE.college;
        normalized.role = normalizeRole(normalized.role || normalized.identity || DEFAULT_PROFILE.role);
        normalized.status = normalizeStatus(normalized.status, normalized.role);
        normalized.avatar = normalized.avatar || normalized.avatarData || DEFAULT_PROFILE.avatar;
        return normalized;
    }

    function saveCurrentUser(user) {
        localStorage.setItem("campusCurrentUser", JSON.stringify(user));
        localStorage.setItem("currentUser", JSON.stringify(user));
        localStorage.setItem("isLogin", "true");
        localStorage.setItem("username", user.nickname || user.name || DEFAULT_PROFILE.nickname);
        localStorage.setItem("studentName", user.nickname || user.name || DEFAULT_PROFILE.nickname);
        saveProfileRecord(user);
        updateStoredUserProfile(user);
    }

    function saveProfileRecord(user) {
        var profiles = readJsonObject("campusProfiles");
        var keys = [
            user.accountKey,
            user.studentId,
            user.username,
            user.phone
        ];

        for (var i = 0; i < keys.length; i++) {
            var key = String(keys[i] || "");
            if (key) {
                profiles[key] = user;
            }
        }

        localStorage.setItem("campusProfiles", JSON.stringify(profiles));
    }

    function updateStoredUserProfile(user) {
        var keys = ["campusUsers", "users", "registeredUsers"];

        for (var i = 0; i < keys.length; i++) {
            var users = readJsonArray(keys[i]);
            if (!users.length) {
                continue;
            }

            var changed = false;
            for (var j = 0; j < users.length; j++) {
                if (isSameUser(users[j], user)) {
                    users[j] = Object.assign({}, users[j], {
                        name: user.name,
                        nickname: user.nickname,
                        username: user.username,
                        studentId: user.studentId,
                        phone: user.phone,
                        gender: user.gender,
                        college: user.college,
                        role: user.role,
                        status: user.status,
                        avatar: user.avatar,
                        password: user.password || users[j].password,
                        accountKey: user.accountKey || users[j].accountKey || users[j].studentId || users[j].username,
                        updatedAt: user.updatedAt
                    });
                    changed = true;
                }
            }

            if (changed) {
                localStorage.setItem(keys[i], JSON.stringify(users));
            }
        }
    }

    function isSameUser(storedUser, currentUser) {
        var storedFields = [
            storedUser.accountKey,
            storedUser.studentId,
            storedUser.username,
            storedUser.account,
            storedUser.phone
        ];
        var currentFields = [
            currentUser.accountKey,
            currentUser.studentId,
            currentUser.username,
            currentUser.phone
        ];

        for (var i = 0; i < storedFields.length; i++) {
            for (var j = 0; j < currentFields.length; j++) {
                if (storedFields[i] && currentFields[j] && String(storedFields[i]) === String(currentFields[j])) {
                    return true;
                }
            }
        }

        return false;
    }

    function readJsonObject(key) {
        var raw = localStorage.getItem(key);
        if (!raw) {
            return {};
        }

        try {
            return JSON.parse(raw) || {};
        } catch (error) {
            return {};
        }
    }

    function readJsonArray(key) {
        var raw = localStorage.getItem(key);
        if (!raw) {
            return [];
        }

        try {
            var data = JSON.parse(raw);
            if (Array.isArray(data)) {
                return data;
            }
        } catch (error) {
            return [];
        }

        return [];
    }


    function initProfileSecurityActions() {
        bindProfileDialog("changePasswordButton", "changePasswordDialog");
        bindProfileDialog("bindPhoneButton", "bindPhoneDialog");
        bindChangePasswordForm();
        bindPhoneForm();
    }

    function bindProfileDialog(buttonId, dialogId) {
        var button = document.getElementById(buttonId);
        var dialog = document.getElementById(dialogId);
        if (!button || !dialog) {
            return;
        }

        button.addEventListener("click", function () {
            if (dialogId === "bindPhoneDialog") {
                setInputValue("bindPhoneInput", normalizeUser(readCurrentUser()).phone || "");
            }
            clearDialogMessages(dialog);
            dialog.hidden = false;
        });

        dialog.addEventListener("click", function (event) {
            if (event.target === dialog || event.target.hasAttribute("data-close-profile-dialog")) {
                closeProfileDialog(dialog);
            }
        });
    }

    function closeProfileDialog(dialog) {
        dialog.hidden = true;
        var form = dialog.querySelector("form");
        if (form) {
            form.reset();
        }
        clearDialogMessages(dialog);
    }

    function clearDialogMessages(dialog) {
        var messages = dialog.querySelectorAll(".form-message");
        for (var i = 0; i < messages.length; i++) {
            messages[i].textContent = "";
            messages[i].className = "form-message";
        }
    }

    function bindChangePasswordForm() {
        var form = document.getElementById("changePasswordForm");
        if (!form) {
            return;
        }

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var user = normalizeUser(readCurrentUser());
            var oldPassword = getInputValue("oldPassword");
            var newPassword = getInputValue("newPassword");
            var confirmPassword = getInputValue("confirmNewPassword");
            var currentPassword = getCurrentAccountPassword(user);

            if (!oldPassword || !newPassword || !confirmPassword) {
                showDialogMessage("passwordDialogMessage", "请完整填写密码信息。", "error");
                return;
            }

            if (currentPassword && oldPassword !== currentPassword) {
                showDialogMessage("passwordDialogMessage", "旧密码不正确，请重新输入。", "error");
                return;
            }

            if (oldPassword === newPassword) {
                showDialogMessage("passwordDialogMessage", "新密码不能和旧密码相同。", "error");
                return;
            }

            if (newPassword.length < 6 || !/^[A-Za-z0-9]+$/.test(newPassword)) {
                showDialogMessage("passwordDialogMessage", "新密码至少 6 位，只能使用数字或英文字母。", "error");
                return;
            }

            if (newPassword !== confirmPassword) {
                showDialogMessage("passwordDialogMessage", "两次输入的新密码不一致。", "error");
                return;
            }

            user.password = newPassword;
            user.updatedAt = new Date().toISOString();
            saveCurrentUser(user);
            saveProfilePassword(user, newPassword);
            showDialogMessage("passwordDialogMessage", "密码已修改，下次登录请使用新密码。", "success");
            form.reset();
        });
    }

    function bindPhoneForm() {
        var form = document.getElementById("bindPhoneForm");
        if (!form) {
            return;
        }

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var phone = getInputValue("bindPhoneInput");
            var user = normalizeUser(readCurrentUser());

            if (!/^1\d{10}$/.test(phone)) {
                showDialogMessage("bindPhoneDialogMessage", "请输入 11 位手机号。", "error");
                return;
            }

            if (isPhoneUsedByOtherAccount(phone, user)) {
                showDialogMessage("bindPhoneDialogMessage", "这个手机号已经绑定其他账号。", "error");
                return;
            }

            user.phone = phone;
            user.mobile = phone;
            user.updatedAt = new Date().toISOString();
            saveCurrentUser(user);
            fillProfileForm(user);
            updateProfileSummary(user);
            showDialogMessage("bindPhoneDialogMessage", "手机号已绑定，可用于验证码登录。", "success");
            showProfileMessage("手机号已同步到个人资料。", "success");
        });
    }

    function showDialogMessage(id, message, type) {
        var target = document.getElementById(id);
        if (!target) {
            return;
        }

        target.textContent = message;
        target.className = "form-message";
        if (type) {
            target.classList.add(type);
        }
    }

    function getCurrentAccountPassword(user) {
        var profile = findProfileRecord(user);
        if (profile && profile.password) {
            return profile.password;
        }

        var users = getAllStoredUsers();
        for (var i = 0; i < users.length; i++) {
            if (isSameUser(users[i], user) && users[i].password) {
                return users[i].password;
            }
        }

        if (String(user.studentId || user.username || "") === "202500001") {
            return "123456";
        }

        return "";
    }

    function saveProfilePassword(user, password) {
        var profileUser = Object.assign({}, user, { password: password });
        saveProfileRecord(profileUser);
        updateStoredUserPassword(profileUser, password);
    }

    function updateStoredUserPassword(user, password) {
        var keys = ["campusUsers", "users", "registeredUsers"];

        for (var i = 0; i < keys.length; i++) {
            var users = readJsonArray(keys[i]);
            var changed = false;
            for (var j = 0; j < users.length; j++) {
                if (isSameUser(users[j], user)) {
                    users[j] = Object.assign({}, users[j], {
                        password: password,
                        phone: user.phone,
                        updatedAt: user.updatedAt
                    });
                    changed = true;
                }
            }

            if (changed) {
                localStorage.setItem(keys[i], JSON.stringify(users));
            }
        }
    }

    function findProfileRecord(user) {
        var profiles = readJsonObject("campusProfiles");
        var keys = [user.accountKey, user.studentId, user.username, user.phone];
        for (var i = 0; i < keys.length; i++) {
            var key = String(keys[i] || "");
            if (key && profiles[key]) {
                return profiles[key];
            }
        }
        return null;
    }

    function getAllStoredUsers() {
        var keys = ["campusUsers", "users", "registeredUsers"];
        var users = [];
        for (var i = 0; i < keys.length; i++) {
            users = users.concat(readJsonArray(keys[i]));
        }
        return users;
    }

    function isPhoneUsedByOtherAccount(phone, currentUser) {
        var users = getAllStoredUsers();
        for (var i = 0; i < users.length; i++) {
            if (String(users[i].phone || users[i].mobile || "") === phone && !isSameUser(users[i], currentUser)) {
                return true;
            }
        }
        return false;
    }


    function bindProfileRoleStatus(user) {
        var roleSelect = document.getElementById("profileRole");
        if (!roleSelect) {
            return;
        }

        roleSelect.addEventListener("change", function () {
            syncProfileStatusOptions(roleSelect.value, "");
        });
    }

    function bindProfileAvatarUpload(onChange) {
        var input = document.getElementById("profileAvatarInput");
        if (!input) {
            return;
        }

        input.addEventListener("change", function () {
            var file = input.files && input.files[0];
            if (!file) {
                return;
            }

            if (!file.type || file.type.indexOf("image/") !== 0) {
                showProfileMessage("请选择图片文件。", "error");
                input.value = "";
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                showProfileMessage("图片不要超过 5MB。", "error");
                input.value = "";
                return;
            }

            readProfileAvatarFile(file).then(function (avatarData) {
                var updatedUser = Object.assign({}, normalizeUser(readCurrentUser()), {
                    avatar: avatarData,
                    updatedAt: new Date().toISOString()
                });

                try {
                    saveCurrentUser(updatedUser);
                } catch (error) {
                    showProfileMessage("头像保存失败，图片可能还是太大了。", "error");
                    input.value = "";
                    return;
                }

                showProfileMessage("头像已更新。", "success");
                input.value = "";
                if (typeof onChange === "function") {
                    onChange(updatedUser);
                }
            }).catch(function () {
                showProfileMessage("头像读取失败，请重新选择。", "error");
                input.value = "";
            });
        });
    }

    function readProfileAvatarFile(file) {
        return new Promise(function (resolve, reject) {
            var image = new Image();
            var objectUrl = URL.createObjectURL(file);

            image.onload = function () {
                URL.revokeObjectURL(objectUrl);
                try {
                    var maxSize = 512;
                    var scale = Math.min(1, maxSize / image.width, maxSize / image.height);
                    var canvas = document.createElement("canvas");
                    canvas.width = Math.max(1, Math.round(image.width * scale));
                    canvas.height = Math.max(1, Math.round(image.height * scale));
                    var context = canvas.getContext("2d");
                    context.drawImage(image, 0, 0, canvas.width, canvas.height);
                    resolve(canvas.toDataURL("image/jpeg", 0.86));
                } catch (error) {
                    reject(error);
                }
            };

            image.onerror = function () {
                URL.revokeObjectURL(objectUrl);
                reject(new Error("avatar image load failed"));
            };

            image.src = objectUrl;
        });
    }

    function syncProfileStatusOptions(role, selectedStatus) {
        var statusSelect = document.getElementById("profileStatus");
        if (!statusSelect) {
            return;
        }

        var normalizedRole = normalizeRole(role);
        var options = normalizedRole === "老师" ? ["在职老师"] : ["在校学生", "毕业学生"];
        statusSelect.innerHTML = "";

        for (var i = 0; i < options.length; i++) {
            var option = document.createElement("option");
            option.value = options[i];
            option.textContent = options[i];
            statusSelect.appendChild(option);
        }

        statusSelect.value = normalizeStatus(selectedStatus, normalizedRole);
    }

    function getProfileStatus(role) {
        var status = getInputValue("profileStatus");
        return normalizeStatus(status, normalizeRole(role));
    }

    function normalizeRole(role) {
        return role === "老师" ? "老师" : "学生";
    }

    function normalizeStatus(status, role) {
        if (normalizeRole(role) === "老师") {
            return "在职老师";
        }

        return status === "毕业学生" ? "毕业学生" : "在校学生";
    }
    function updateProfileAvatar(user) {
        var avatar = document.getElementById("profileAvatar");
        if (avatar) {
            avatar.src = getProfileAvatar(user);
            avatar.alt = (user && (user.nickname || user.name)) ? (user.nickname || user.name) + "的头像" : "个人头像";
        }
    }

    function getProfileAvatar(user) {
        return (user && (user.avatar || user.avatarData)) || DEFAULT_PROFILE.avatar || "images/vercel-assets/asset-002.png";
    }

    function updateProfileSummary(user) {
        setTextContent("profileSummaryName", user.nickname || user.name || DEFAULT_PROFILE.nickname);
        setTextContent("profileSummaryStudentId", user.studentId || user.username || DEFAULT_PROFILE.studentId);
        setTextContent("profileSummaryCollege", user.college || DEFAULT_PROFILE.college);
        setTextContent("profileSummaryRole", normalizeRole(user.role || DEFAULT_PROFILE.role));
    }
    function getAvatarText(user) {
        var name = (user && (user.nickname || user.name || user.username || user.studentId)) || "校";
        return String(name).trim().charAt(0) || "校";
    }

    function getInputValue(id) {
        var input = document.getElementById(id);
        return input ? input.value.trim() : "";
    }

    function setInputValue(id, value) {
        var input = document.getElementById(id);
        if (input) {
            input.value = value || "";
        }
    }
    function setTextContent(id, value) {
        var target = document.getElementById(id);
        if (target) {
            target.textContent = value || "";
        }
    }
    function getRadioValue(name) {
        var checked = document.querySelector("input[name='" + name + "']:checked");
        return checked ? checked.value : "";
    }

    function setRadioValue(name, value) {
        var radios = document.querySelectorAll("input[name='" + name + "']");
        for (var i = 0; i < radios.length; i++) {
            radios[i].checked = radios[i].value === value;
        }
    }

    function showProfileMessage(message, type) {
        var target = document.getElementById("profileMessage");
        if (!target) {
            return;
        }

        target.textContent = message;
        target.className = "form-message";
        if (type) {
            target.classList.add(type);
        }
    }

    function readCurrentUser() {
        var keys = ["campusCurrentUser", "currentUser", "loginUser", "loggedInUser"];

        for (var i = 0; i < keys.length; i++) {
            var raw = localStorage.getItem(keys[i]);
            var user = parseUser(raw);
            if (user) {
                return user;
            }
        }

        if (localStorage.getItem("isLogin") === "true" || localStorage.getItem("isLoggedIn") === "true") {
            return {
                name: localStorage.getItem("username") || localStorage.getItem("studentName") || "校园生活助手用户"
            };
        }

        return null;
    }

    function parseUser(raw) {
        if (!raw) {
            return null;
        }

        try {
            var user = JSON.parse(raw);
            if (user && typeof user === "object") {
                return user;
            }
        } catch (error) {
            return { name: raw };
        }

        return null;
    }

    function clearLoginState() {
        var keys = [
            "campusCurrentUser",
            "currentUser",
            "loginUser",
            "loggedInUser",
            "isLogin",
            "isLoggedIn",
            "username",
            "studentName"
        ];

        for (var i = 0; i < keys.length; i++) {
            localStorage.removeItem(keys[i]);
        }
    }

    var CAMPUS_PET_SERVICES = [
        {
                "title": "校园卡挂失",
                "category": "证件卡务",
                "summary": "校园卡丢失后可通过微信入口快速挂失，也可以按同一入口进行解挂。",
                "location": "微信搜索“江财现经管校园卡”，进入校园卡服务入口。",
                "materials": [
                        "微信账号",
                        "校园卡绑定信息",
                        "学号或统一身份认证信息",
                        "需要解挂时确认卡片已找回"
                ],
                "time": "发现校园卡丢失后建议立即在微信端挂失；找回后再按流程解挂。",
                "steps": [
                        "打开微信并搜索“江财现经管校园卡”",
                        "进入校园卡服务入口后点击“挂失/解挂”",
                        "进入挂失/解挂页面后点击右上角的锁形图标完成操作",
                        "操作后检查校园卡状态，确认是否已挂失或解挂成功"
                ],
                "notes": [
                        "挂失后如果找回旧卡，不要直接继续使用，先按同一入口确认是否可以解挂。",
                        "如果微信端无法处理，可再联系校园卡服务点或智慧校园中心。",
                        "具体以微信入口展示和学校最新通知为准。"
                ],
                "keywords": [
                        "校园卡",
                        "饭卡",
                        "挂失",
                        "解挂",
                        "微信",
                        "江财现经管校园卡",
                        "锁",
                        "补卡",
                        "门禁"
                ]
        },
        {
                "title": "请假流程",
                "category": "生活事务",
                "summary": "请假必须在掌上学工提交申请，并提前和班主任说明原因，审核通过后再同步截图给学委或老师。",
                "location": "微信搜索“江财现经管学工”，进入后点击“掌上学工”，再点击“请假申请”。",
                "materials": [
                        "微信账号",
                        "请假原因说明",
                        "请假起止时间",
                        "必要时提供病历、车票或其他证明材料",
                        "审核通过后的请假截图"
                ],
                "time": "原则上提前在掌上学工申请；突发情况应第一时间和班主任说明，再尽快补齐线上申请。",
                "steps": [
                        "打开微信并搜索“江财现经管学工”",
                        "进入后点击“掌上学工”",
                        "在掌上学工中点击“请假申请”并填写请假信息",
                        "提交前和班主任说清楚请假原因、时间和去向",
                        "等待审核通过后，将请假截图发给学委或者老师留存"
                ],
                "notes": [
                        "请假必须在掌上学工申请，不能只口头说明。",
                        "请假前要和班主任说清楚，避免信息不同步。",
                        "审核通过后及时把截图发给学委或者老师，方便考勤和课堂记录。",
                        "具体以学院和班级最新要求为准。"
                ],
                "keywords": [
                        "请假",
                        "假条",
                        "掌上学工",
                        "江财现经管学工",
                        "班主任",
                        "学委",
                        "审核",
                        "截图",
                        "病假",
                        "事假",
                        "离校"
                ]
        },
        {
                "title": "电费/复电流程",
                "category": "生活事务",
                "summary": "宿舍断电先判断原因：电费不足断电只需要充值电费；因大功率电器或其他原因断电，才需要提交复电申请。",
                "location": "复电申请入口：微信搜索“江财现经管学工”并进入掌上学工；电费充值需先在中国建设银行 APP 给校园卡充值余额，再到“江财现经管校园卡”公众号用校园卡余额充值电费。",
                "materials": [
                        "宿舍楼栋",
                        "宿舍号",
                        "校园卡头像下方的一卡通充值账号",
                        "断电原因说明",
                        "必要时准备充值或复电申请截图"
                ],
                "time": "电费不足时充值完成后等待几分钟通常即可来电；因大功率或其他原因断电时，按掌上学工复电申请审核结果处理。",
                "steps": [
                        "先判断断电原因：电费不足只充值电费，使用大功率或其他原因断电才申请复电",
                        "复电申请：微信搜索“江财现经管学工”，点击“掌上学工”，再点击“复电申请”",
                        "电费充值第 1 步：在中国建设银行 APP 搜索“校园卡充值”，点击“江西财大经管学院一卡通”，先为校园卡充值余额",
                        "电费充值第 2 步：微信搜索“江财现经管校园卡”，点击“校园卡”进入，再点击“电费”，使用校园卡余额为宿舍电费充值",
                        "充值时填写一卡通账号，一卡通账号在校园卡头像下方的充值账号位置",
                        "电费充值完成后等待几分钟，通常即可恢复来电"
                ],
                "notes": [
                        "只有因为使用大功率电器或其他非欠费原因断电时，才需要走复电申请。",
                        "电费不足导致断电时，不需要申请复电；先在中国建设银行 APP 为校园卡充值余额，再到公众号用校园卡余额充值电费。",
                        "电费充值消耗的是校园卡余额，所以校园卡余额不足时要先完成校园卡充值。",
                        "不要自行打开配电箱或私自接线，避免触电和安全事故。",
                        "具体以掌上学工、校园卡入口和学校最新通知为准。"
                ],
                "keywords": [
                        "电费",
                        "复电",
                        "断电",
                        "停电",
                        "宿舍电",
                        "充值",
                        "掌上学工",
                        "江财现经管学工",
                        "复电申请",
                        "中国建设银行",
                        "校园卡充值",
                        "一卡通",
                        "充值账号",
                        "大功率"
                ]
        },
        {
                "title": "公寓报修",
                "category": "生活事务",
                "summary": "宿舍设施有任何问题都可以通过掌上学工提交公寓报修，方便后续维修人员联系和处理。",
                "location": "微信搜索“江财现经管学工”公众号，点击“掌上学工”，再点击“公寓报修”。",
                "materials": [
                        "宿舍楼栋和宿舍号",
                        "报修人姓名与联系方式",
                        "故障位置和问题描述",
                        "现场照片或视频"
                ],
                "time": "宿舍设施出现问题后可及时提交报修；漏水、断电等紧急情况也要同步联系宿管或值班人员。",
                "steps": [
                        "打开微信并搜索“江财现经管学工”公众号",
                        "进入公众号后点击“掌上学工”",
                        "在掌上学工中点击“公寓报修”",
                        "填写宿舍楼栋、宿舍号、联系方式和故障说明",
                        "提交后保持手机畅通，等待维修人员联系或上门处理"
                ],
                "notes": [
                        "宿舍设施有任何问题都能报修，例如门锁、水电、家具、空调、漏水等。",
                        "报修描述尽量具体，最好补充现场照片或视频，方便维修人员判断问题。",
                        "紧急安全问题要第一时间联系宿管，不要只等待线上反馈。",
                        "具体以掌上学工和公寓管理要求为准。"
                ],
                "keywords": [
                        "公寓报修",
                        "报修",
                        "掌上学工",
                        "江财现经管学工",
                        "宿舍设施",
                        "宿舍维修",
                        "维修",
                        "门锁",
                        "漏水",
                        "空调",
                        "家具",
                        "水电"
                ]
        },
        {
                "title": "成绩查询",
                "category": "学习事务",
                "summary": "成绩查询需在电脑端进入学院官网的教务系统，登录后从课程管理中的“我的成绩”查看，打印预览页面信息更全面。",
                "location": "电脑端搜索“江西财经大学现代经济管理学院官网”，点击官网右上角“教务系统”，登录后进入左侧“课程管理”下的“我的成绩”。",
                "materials": [
                        "电脑设备",
                        "校园网或 VPN 连接",
                        "教务系统账号",
                        "教务系统密码",
                        "必要时准备验证码或统一身份认证信息"
                ],
                "time": "成绩发布时间以任课教师录入和教务通知为准；系统访问人数较多时可错峰查询。",
                "steps": [
                        "先确认电脑已连接校园网；不在校园网环境时需先连接 VPN",
                        "在电脑端搜索“江西财经大学现代经济管理学院官网”并进入官网",
                        "点击官网右上角“教务系统”",
                        "登录教务系统后，在左侧菜单找到“课程管理”",
                        "点击“课程管理”下的“我的成绩”查看成绩",
                        "如需查看更完整信息，可点击“打印预览”",
                        "如对成绩有疑问，按学校规定时间申请复核"
                ],
                "notes": [
                        "登录教务系统需要连接校园网或者 VPN，否则可能无法进入。",
                        "“打印预览”页面显示的信息通常更全面，查询或截图时可以优先查看。",
                        "成绩刚发布时系统可能访问人数较多，可错峰查询。",
                        "具体以教务系统、学院官网和学校最新通知为准。"
                ],
                "keywords": [
                        "成绩",
                        "查分",
                        "教务系统",
                        "课程管理",
                        "我的成绩",
                        "打印预览",
                        "江西财经大学现代经济管理学院",
                        "学院官网",
                        "校园网",
                        "VPN",
                        "vpn",
                        "绩点",
                        "补考"
                ]
        },
        {
                "title": "二课学分申请/查询",
                "category": "学习事务",
                "summary": "二课学分可在掌上学工应用中心申请和查询，提交时要选好学分类型、填写分值，并上传符合要求的截图材料。",
                "location": "微信搜索“江财现经管学工”公众号，点击“掌上学工”，进入后点击“应用中心”，再点击“二课学分申请”。",
                "materials": [
                        "微信账号",
                        "学分类型",
                        "申请分值",
                        "活动或证明截图",
                        "下发 Excel 表格中筛选出的本人记录截图"
                ],
                "time": "建议在学院通知或活动材料下发后及时申请；审核、查询和补正时间以掌上学工、学院通知和负责老师要求为准。",
                "steps": [
                        "打开微信并搜索“江财现经管学工”公众号",
                        "进入公众号后点击“掌上学工”",
                        "进入掌上学工后点击“应用中心”",
                        "在应用中心点击“二课学分申请”",
                        "按要求选择学分类型，填写申请分值，并上传截图材料",
                        "在下发的 Excel 表格中使用筛选功能筛出自己的那一项，截图只需要截到表头和自己的那一行",
                        "提交后留意审核状态，必要时按老师要求补充或修改材料"
                ],
                "notes": [
                        "学分申请必须写清楚学分类型和分值，截图材料要能对应本人记录。",
                        "Excel 截图不要截整张表，只截表头和自己的那一行，方便审核老师快速核对。",
                        "本科需要修满二课学分总 4 分：思想政治与道德素养（必修）1 学分，劳动教育（必修）1 学分，其他学分 2 学分。",
                        "具体以掌上学工、学院通知和负责老师要求为准。"
                ],
                "keywords": [
                        "二课",
                        "二课学分",
                        "第二课堂",
                        "学分申请",
                        "学分查询",
                        "掌上学工",
                        "江财现经管学工",
                        "应用中心",
                        "Excel",
                        "筛选",
                        "截图",
                        "思想政治",
                        "道德素养",
                        "劳动教育"
                ]
        },
        {
                "title": "校园网/VPN",
                "category": "学习事务",
                "summary": "校园网可通过 GiWiFi 校园助手连接寝室 WiFi；VPN 可按教务系统登录页下方提示或学校客户端说明连接，用于进入教务系统等校内资源。",
                "location": "校园网：下载并登录 GiWiFi 校园助手，连接带有自己寝室号的 WiFi；VPN：查看教务系统登录页下方连接步骤，或访问 https://218.65.6.122:4433、下载客户端使用。",
                "materials": [
                        "手机或电脑设备",
                        "GiWiFi 校园助手",
                        "学号或一卡通账号",
                        "校园网套餐或按天充值费用",
                        "VPN 账号密码",
                        "学校 VPN 客户端安装包"
                ],
                "time": "评教、下载考条、查询成绩等需要进入教务系统时可按需使用校园网或 VPN；VPN 主要用于校外访问校内资源。",
                "steps": [
                        "下载安装 GiWiFi 校园助手，图标可参考右侧图片",
                        "登录后将 WiFi 连接到带有自己寝室号的 WiFi 名称，例如 GiWiFi5G-SXA-111 表示尚信楼 A 栋 111 号",
                        "确认连接的是自己寝室对应的 WiFi，不要随意连接其他寝室 WiFi",
                        "如果手机卡没有校园网套餐，可在 GiWiFi 校园助手内按需充值，一天 2 元",
                        "需要进入教务系统但不在校园网环境时，先打开教务系统登录页面，查看登录框下方的连接 VPN 具体步骤",
                        "按教务系统登录页下方提示完成 VPN 连接后，再登录教务系统",
                        "也可以访问 VPN 网页地址 https://218.65.6.122:4433，遇到证书提示可继续浏览；账号一般为本人一卡通账号或学号，初始密码默认六个 0",
                        "如使用客户端方式，可下载本页提供的 VPN 客户端安装包，安装后填写 VPN 地址和端口，登录成功后再访问教务系统链接"
                ],
                "notes": [
                        "一个学期通常只有评教、下载考条、查看成绩等少数场景需要进入教务系统，需要时按天购买校园网会比较方便。",
                        "校园网要连接自己寝室号对应的 WiFi，例如 WiFi 名 GiWiFi5G-SXA-111 对应尚信楼 A 栋 111 号。",
                        "教务系统登录页下方有连接 VPN 的具体步骤，遇到不会连接时优先看该页面提示。",
                        "VPN 是校外访问校内资源时使用；在办公区域或已连校园网时，一般可直接访问校内资源，不需要开启 VPN。",
                        "账号和密码不要外借；首次使用或登录失败时，按学校 VPN 说明或网络信息管理中心要求处理。",
                        "具体以 GiWiFi 校园助手、教务系统登录页、学校 VPN 系统和学校最新通知为准。"
                ],
                "keywords": [
                        "校园网",
                        "VPN",
                        "vpn",
                        "GiWiFi",
                        "WiFi校园助手",
                        "校园助手",
                        "寝室号",
                        "尚信楼",
                        "校园网套餐",
                        "一天2元",
                        "2元",
                        "评教",
                        "考条",
                        "成绩",
                        "教务系统",
                        "登录页面",
                        "连接VPN",
                        "一卡通",
                        "SecSetup"
                ]
        }
];

    function initCampusPetAssistant() {
        var existingAssistant = document.getElementById("campusPetAssistant");
        if (existingAssistant && existingAssistant.getAttribute("data-pet-owner") === "service") {
            return;
        }

        injectCampusPetAssistant();
        bindCampusPetAssistant(CAMPUS_PET_SERVICES);
    }

    function injectCampusPetAssistant() {
        if (document.getElementById("campusPetAssistant")) {
            return;
        }

        var assistant = document.createElement("aside");
        assistant.className = "campus-pet-assistant";
        assistant.id = "campusPetAssistant";
        assistant.setAttribute("aria-label", "小橘校园问答");
        assistant.innerHTML =
            '<section class="pet-chat-panel" id="campusPetChat" aria-hidden="true" aria-labelledby="petChatTitle">' +
                '<div class="pet-chat-header" id="petChatHeader">' +
                    '<div class="pet-chat-brand-mark" aria-hidden="true"><span></span></div>' +
                    '<div class="pet-chat-title-block"><span>小橘校园助手</span><h2 id="petChatTitle">校园问答</h2></div>' +
                    '<button class="pet-chat-close" id="petChatClose" type="button" aria-label="关闭校园问答">&times;</button>' +
                '</div>' +
                '<div class="pet-chat-messages" id="petChatMessages" role="log" aria-live="polite">' +
                    '<div class="pet-message pet-message-bot"><img class="pet-message-avatar" src="images/vercel-assets/asset-011.png" alt="小橘学长头像"><div class="pet-message-body"><p>你好呀同学，我是小橘学长喵～</p><p>新生报到、校园生活、学习事务、办事流程、学生手册和学校政策相关问题，都可以来问我。别急，我帮你慢慢捋清楚喵。</p></div></div>' +
                '</div>' +
                '<div class="pet-chat-suggestions" aria-label="常见问题">' +
                    '<div class="pet-suggestion-title"><span aria-hidden="true">☆</span>猜你想问</div>' +
                    '<div class="pet-suggestion-list">' +
                        '<button class="tone-green" type="button" data-pet-question="校园卡丢了怎么办"><span aria-hidden="true">▰</span>校园卡丢了怎么办</button>' +
                        '<button class="tone-amber" type="button" data-pet-question="宿舍停电怎么处理"><span aria-hidden="true">▾</span>宿舍停电怎么处理</button>' +
                        '<button class="tone-blue" type="button" data-pet-question="成绩怎么查询"><span aria-hidden="true">▮</span>成绩怎么查询</button>' +
                        '<button class="tone-purple" type="button" data-pet-question="请假流程怎么走"><span aria-hidden="true">▣</span>请假流程怎么走</button>' +
                        '<button class="tone-red" type="button" data-pet-question="新生报到要带什么"><span aria-hidden="true">▤</span>新生报到要带什么</button>' +
                    '</div>' +
                '</div>' +
                '<form class="pet-chat-form" id="petChatForm">' +
                    '<div class="pet-chat-input-shell"><span class="pet-input-face" aria-hidden="true"></span><input id="petChatInput" type="text" autocomplete="off" placeholder="问问小橘校园问题..."><span class="pet-input-image" aria-hidden="true"></span></div>' +
                    '<button type="submit">发送</button>' +
                '</form>' +
                '<p class="pet-chat-privacy">小橘会保护你的隐私，请放心提问哦～</p>' +
                '<div class="pet-resize-handle resize-n" data-resize-edge="n" aria-hidden="true"></div>' +
                '<div class="pet-resize-handle resize-e" data-resize-edge="e" aria-hidden="true"></div>' +
                '<div class="pet-resize-handle resize-s" data-resize-edge="s" aria-hidden="true"></div>' +
                '<div class="pet-resize-handle resize-w" data-resize-edge="w" aria-hidden="true"></div>' +
                '<div class="pet-resize-handle resize-ne" data-resize-edge="ne" aria-hidden="true"></div>' +
                '<div class="pet-resize-handle resize-se" data-resize-edge="se" aria-hidden="true"></div>' +
                '<div class="pet-resize-handle resize-sw" data-resize-edge="sw" aria-hidden="true"></div>' +
                '<div class="pet-resize-handle resize-nw" data-resize-edge="nw" aria-hidden="true"></div>' +            '</section>' +
            '<button class="pet-toggle" id="campusPetToggle" type="button" aria-label="打开小橘校园问答">' +
                '<img id="campusPetImage" src="images/vercel-assets/asset-012.png" alt="小橘猫校园助手" draggable="false">' +
            '</button>';

        document.body.appendChild(assistant);
    }

    function bindCampusPetAssistant(data) {
        var assistant = document.getElementById("campusPetAssistant");
        var petButton = document.getElementById("campusPetToggle");
        var petImage = document.getElementById("campusPetImage");
        var chatPanel = document.getElementById("campusPetChat");
        var chatHeader = document.getElementById("petChatHeader");
        var closeButton = document.getElementById("petChatClose");
        var messages = document.getElementById("petChatMessages");
        var form = document.getElementById("petChatForm");
        var input = document.getElementById("petChatInput");
        var suggestions = assistant ? assistant.querySelector(".pet-chat-suggestions") : null;
        var resizeHandles = assistant ? assistant.querySelectorAll(".pet-resize-handle") : [];

        if (!assistant || !petButton || !petImage || !chatPanel || !chatHeader || !closeButton || !messages || !form || !input) {
            return;
        }

        var petImages = {
            idle: "images/vercel-assets/asset-012.png",
            hover: "images/vercel-assets/asset-030.png",
            active: "images/vercel-assets/asset-031.png"
        };
        var dragState = null;
        var resizeState = null;
        var chatDragState = null;
        var suppressClick = false;
        var currentConversationId = localStorage.getItem("campusPetConversationId") || "";

        restoreChatSize();
        restoreChatPosition();
        restorePetPosition(assistant, petButton);
        bindResizeHandles();
        bindChatDrag();
        setPetMode("idle");
        updateChatPlacement();

        petButton.addEventListener("click", function (event) {
            if (suppressClick) {
                event.preventDefault();
                suppressClick = false;
                return;
            }

            if (assistant.classList.contains("is-open")) {
                closeChat();
            } else {
                openChat();
            }
        });

        petButton.addEventListener("mouseenter", function () {
            if (!assistant.classList.contains("is-open") && !dragState) {
                setPetMode("hover");
            }
        });

        petButton.addEventListener("mouseleave", function () {
            if (!assistant.classList.contains("is-open") && !dragState) {
                setPetMode("idle");
            }
        });

        petButton.addEventListener("pointerdown", function (event) {
            if (event.button !== undefined && event.button !== 0) {
                return;
            }

            var rect = assistant.getBoundingClientRect();
            dragState = {
                pointerId: event.pointerId,
                startX: event.clientX,
                startY: event.clientY,
                left: rect.left,
                top: rect.top,
                moved: false
            };
            assistant.classList.add("is-pressing");

            if (petButton.setPointerCapture) {
                petButton.setPointerCapture(event.pointerId);
            }
        });

        petButton.addEventListener("pointermove", function (event) {
            if (!dragState) {
                return;
            }

            var dx = event.clientX - dragState.startX;
            var dy = event.clientY - dragState.startY;
            if (!dragState.moved && Math.abs(dx) + Math.abs(dy) < 6) {
                return;
            }

            dragState.moved = true;
            assistant.classList.add("is-dragging");
            event.preventDefault();
            movePetTo(dragState.left + dx, dragState.top + dy);
            updateChatPlacement();
        });

        petButton.addEventListener("pointerup", endPetDrag);
        petButton.addEventListener("pointercancel", endPetDrag);
        closeButton.addEventListener("click", closeChat);

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            submitPetQuestion(input.value);
        });

        if (suggestions) {
            suggestions.addEventListener("click", function (event) {
                var button = event.target.closest("button[data-pet-question]");
                if (button) {
                    submitPetQuestion(button.getAttribute("data-pet-question"));
                }
            });
        }

        messages.addEventListener("click", function (event) {
            var button = event.target.closest("button[data-pet-service]");
            if (button) {
                openPetService(button.getAttribute("data-pet-service"));
            }
        });

        window.addEventListener("resize", function () {
            clampStoredPetPosition();
            clampChatSizeToViewport();
            clampDetachedChatPosition();
            updateChatPlacement();
        });

        function bindResizeHandles() {
            for (var i = 0; i < resizeHandles.length; i++) {
                resizeHandles[i].addEventListener("pointerdown", startChatResize);
            }
        }

        function bindChatDrag() {
            chatHeader.addEventListener("pointerdown", function (event) {
                if (event.button !== undefined && event.button !== 0) {
                    return;
                }
                if (event.target.closest("button")) {
                    return;
                }

                detachChatFromCurrentRect();
                var rect = chatPanel.getBoundingClientRect();
                chatDragState = {
                    startX: event.clientX,
                    startY: event.clientY,
                    left: rect.left,
                    top: rect.top
                };
                assistant.classList.add("is-chat-dragging");
                event.preventDefault();
                if (chatHeader.setPointerCapture) {
                    try {
                        chatHeader.setPointerCapture(event.pointerId);
                    } catch (error) {
                        // Pointer capture may already be unavailable.
                    }
                }
                document.addEventListener("pointermove", dragChat);
                document.addEventListener("pointerup", endChatDrag);
                document.addEventListener("pointercancel", endChatDrag);
            });
        }

        function dragChat(event) {
            if (!chatDragState) {
                return;
            }
            applyChatPosition(chatDragState.left + event.clientX - chatDragState.startX, chatDragState.top + event.clientY - chatDragState.startY);
        }

        function endChatDrag() {
            if (!chatDragState) {
                return;
            }
            chatDragState = null;
            assistant.classList.remove("is-chat-dragging");
            document.removeEventListener("pointermove", dragChat);
            document.removeEventListener("pointerup", endChatDrag);
            document.removeEventListener("pointercancel", endChatDrag);
            saveChatPosition();
        }

        function startChatResize(event) {
            var edge = event.currentTarget.getAttribute("data-resize-edge") || "se";
            detachChatFromCurrentRect();
            var rect = chatPanel.getBoundingClientRect();
            resizeState = {
                edge: edge,
                startX: event.clientX,
                startY: event.clientY,
                left: rect.left,
                top: rect.top,
                width: rect.width,
                height: rect.height
            };
            assistant.classList.add("is-resizing");
            event.preventDefault();
            event.stopPropagation();
            document.addEventListener("pointermove", resizeChat);
            document.addEventListener("pointerup", endChatResize);
            document.addEventListener("pointercancel", endChatResize);
        }

        function resizeChat(event) {
            if (!resizeState) {
                return;
            }
            var dx = event.clientX - resizeState.startX;
            var dy = event.clientY - resizeState.startY;
            var width = resizeState.width;
            var height = resizeState.height;
            var left = resizeState.left;
            var top = resizeState.top;

            if (resizeState.edge.indexOf("e") !== -1) width += dx;
            if (resizeState.edge.indexOf("w") !== -1) width -= dx;
            if (resizeState.edge.indexOf("s") !== -1) height += dy;
            if (resizeState.edge.indexOf("n") !== -1) height -= dy;

            var size = applyChatSize(width, height);
            if (resizeState.edge.indexOf("w") !== -1) left = resizeState.left + resizeState.width - size.width;
            if (resizeState.edge.indexOf("n") !== -1) top = resizeState.top + resizeState.height - size.height;
            applyChatPosition(left, top);
        }

        function endChatResize() {
            if (!resizeState) {
                return;
            }
            resizeState = null;
            assistant.classList.remove("is-resizing");
            document.removeEventListener("pointermove", resizeChat);
            document.removeEventListener("pointerup", endChatResize);
            document.removeEventListener("pointercancel", endChatResize);
            saveChatSize();
            saveChatPosition();
            updateChatPlacement();
        }

        function openChat() {
            assistant.classList.add("is-open");
            chatPanel.setAttribute("aria-hidden", "false");
            petButton.setAttribute("aria-label", "\u5173\u95ed\u5c0f\u6a58\u6821\u56ed\u95ee\u7b54");
            setPetMode("active");
            updateChatPlacement();
            window.setTimeout(function () { input.focus(); }, 120);
        }

        function closeChat() {
            assistant.classList.remove("is-open");
            chatPanel.setAttribute("aria-hidden", "true");
            petButton.setAttribute("aria-label", "\u6253\u5f00\u5c0f\u6a58\u6821\u56ed\u95ee\u7b54");
            setPetMode("idle");
        }

        function setPetMode(mode) {
            if (assistant.classList.contains("is-open")) {
                mode = "active";
            }
            assistant.classList.toggle("is-hovering", mode === "hover");
            petImage.src = petImages[mode] || petImages.idle;
        }

        function endPetDrag(event) {
            if (!dragState) {
                return;
            }
            if (petButton.releasePointerCapture) {
                try {
                    petButton.releasePointerCapture(event.pointerId);
                } catch (error) {
                    // Pointer capture may already be released by the browser.
                }
            }
            assistant.classList.remove("is-pressing", "is-dragging");
            if (dragState.moved) {
                suppressClick = true;
                savePetPosition(assistant);
                updateChatPlacement();
            }
            dragState = null;
            if (!assistant.classList.contains("is-open")) {
                setPetMode("idle");
            }
        }

        function movePetTo(left, top) {
            var width = petButton.offsetWidth || 95;
            var height = petButton.offsetHeight || 77;
            assistant.style.left = clamp(left, 12, Math.max(12, window.innerWidth - width - 12)) + "px";
            assistant.style.top = clamp(top, 12, Math.max(12, window.innerHeight - height - 12)) + "px";
            assistant.style.right = "auto";
            assistant.style.bottom = "auto";
        }

        function clampStoredPetPosition() {
            if (!assistant.style.left || !assistant.style.top) return;
            movePetTo(parseFloat(assistant.style.left), parseFloat(assistant.style.top));
        }

        function restoreChatSize() {
            try {
                var saved = JSON.parse(localStorage.getItem("campusPetChatSize") || "null");
                if (saved && typeof saved.width === "number" && typeof saved.height === "number") {
                    applyChatSize(saved.width, saved.height);
                }
            } catch (error) {
                localStorage.removeItem("campusPetChatSize");
            }
        }

        function saveChatSize() {
            localStorage.setItem("campusPetChatSize", JSON.stringify({ width: getChatWidth(), height: getChatHeight() }));
        }

        function applyChatSize(width, height) {
            var nextWidth = clamp(width, 420, Math.max(360, window.innerWidth - 48));
            var nextHeight = clamp(height, 430, Math.max(360, window.innerHeight - 48));
            assistant.style.setProperty("--pet-chat-width", nextWidth + "px");
            assistant.style.setProperty("--pet-chat-height", nextHeight + "px");
            return { width: nextWidth, height: nextHeight };
        }

        function clampChatSizeToViewport() {
            applyChatSize(getChatWidth(), getChatHeight());
        }

        function getChatWidth() {
            var value = parseFloat(getComputedStyle(assistant).getPropertyValue("--pet-chat-width"));
            return Number.isFinite(value) ? value : 560;
        }

        function getChatHeight() {
            var value = parseFloat(getComputedStyle(assistant).getPropertyValue("--pet-chat-height"));
            return Number.isFinite(value) ? value : 640;
        }

        function detachChatFromCurrentRect() {
            if (assistant.classList.contains("chat-detached")) return;
            var rect = chatPanel.getBoundingClientRect();
            assistant.classList.add("chat-detached");
            applyChatPosition(rect.left, rect.top);
        }

        function restoreChatPosition() {
            try {
                var saved = JSON.parse(localStorage.getItem("campusPetChatPosition") || "null");
                if (saved && typeof saved.left === "number" && typeof saved.top === "number") {
                    assistant.classList.add("chat-detached");
                    applyChatPosition(saved.left, saved.top);
                }
            } catch (error) {
                localStorage.removeItem("campusPetChatPosition");
            }
        }

        function saveChatPosition() {
            if (!assistant.classList.contains("chat-detached")) return;
            localStorage.setItem("campusPetChatPosition", JSON.stringify({ left: getChatLeft(), top: getChatTop() }));
        }

        function applyChatPosition(left, top) {
            var maxLeft = Math.max(12, window.innerWidth - getChatWidth() - 12);
            var maxTop = Math.max(12, window.innerHeight - getChatHeight() - 12);
            assistant.style.setProperty("--pet-chat-left", clamp(left, 12, maxLeft) + "px");
            assistant.style.setProperty("--pet-chat-top", clamp(top, 12, maxTop) + "px");
        }

        function clampDetachedChatPosition() {
            if (!assistant.classList.contains("chat-detached")) return;
            applyChatPosition(getChatLeft(), getChatTop());
        }

        function getChatLeft() {
            var value = parseFloat(getComputedStyle(assistant).getPropertyValue("--pet-chat-left"));
            return Number.isFinite(value) ? value : 240;
        }

        function getChatTop() {
            var value = parseFloat(getComputedStyle(assistant).getPropertyValue("--pet-chat-top"));
            return Number.isFinite(value) ? value : 150;
        }

        function updateChatPlacement() {
            if (assistant.classList.contains("chat-detached")) return;
            positionChatPanel(assistant);
        }

        function submitPetQuestion(rawQuestion) {
            var question = String(rawQuestion || "").trim();
            if (!question) return;
            openChat();
            addPetMessage(messages, "user", question);
            input.value = "";
            var thinking = addPetMessage(messages, "bot", "小橘学长正在思考中……", [], true);

            requestAgentReply(question, thinking).catch(function () {
                updatePetMessage(messages, thinking, "我这边暂时没有连上知识库，稍后再试试喵。");
                thinking.classList.remove("pet-message-thinking");
            });
        }

        function getChatApiUrl() {
            if (window.CAMPUS_CHAT_API_URL) {
                return window.CAMPUS_CHAT_API_URL;
            }

            if (window.location.hostname.slice(-10) === ".github.io") {
                return "https://campus-life-assistant.vercel.app/api/chat";
            }

            return "/api/chat";
        }
        function requestAgentReply(message, botMessage) {
            var renderedText = "";
            var pendingText = "";
            var typingTimer = null;
            var streamFinished = false;
            var finishTyping = null;

            function typeNextCharacter() {
                if (!pendingText) {
                    clearInterval(typingTimer);
                    typingTimer = null;
                    if (streamFinished && finishTyping) {
                        finishTyping();
                        finishTyping = null;
                    }
                    return;
                }

                renderedText += pendingText.charAt(0);
                pendingText = pendingText.slice(1);
                botMessage.classList.remove("pet-message-thinking");
                updatePetMessage(messages, botMessage, renderedText);
            }

            function queueText(text) {
                pendingText += text;
                if (!typingTimer) {
                    typingTimer = setInterval(typeNextCharacter, 22);
                }
            }

            function finishTypewriter() {
                streamFinished = true;
                if (!typingTimer && !pendingText) {
                    return Promise.resolve();
                }
                return new Promise(function (resolve) {
                    finishTyping = resolve;
                });
            }

            return fetch(getChatApiUrl(), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message: message,
                    conversationId: currentConversationId
                })
            }).then(function (response) {
                if (!response.ok) {
                    throw new Error("Chat request failed");
                }
                return response.json();
            }).then(function (data) {
                if (data.conversationId) {
                    currentConversationId = data.conversationId;
                    localStorage.setItem("campusPetConversationId", currentConversationId);
                }
                if (!data.reply) {
                    throw new Error("Chat response is empty");
                }
                queueText(data.reply);
                return finishTypewriter();
            });
        }
    }

    function buildPetReply(question, sourceData) {
        var matches = searchPetServices(question, sourceData).slice(0, 3);
        var greetings = ["你好", "hi", "hello", "哈喽", "小橘"];
        if (greetings.indexOf(String(question).trim().toLowerCase()) !== -1) {
            return {
                text: "你好呀，我是小橘。你可以直接问我校园卡、请假、电费、报修、成绩、二课或校园网/VPN 的问题。",
                matches: []
            };
        }

        if (matches.length) {
            var top = matches[0];
            var service = top.service;
            var materials = service.materials.slice(0, 3).join("、");
            var text = "我在校园办事里找到「" + service.title + "」。\n" + service.summary + "\n办理入口：" + service.location + "\n建议先准备：" + materials + "。";
            if (matches.length > 1) {
                text += "\n还可能相关：" + matches.slice(1).map(function (item) {
                    return "「" + item.service.title + "」";
                }).join("、") + "。";
            }
            return { text: text, matches: matches.map(function (item) { return item.service; }) };
        }

        return {
            text: "我暂时没在校园办事数据里找到特别匹配的事项。可以换成“请假”“电费”“成绩”“VPN”“二课”等关键词试试。",
            matches: []
        };
    }

    function searchPetServices(question, sourceData) {
        var query = normalizePetText(question);
        var results = [];
        if (!query) {
            return results;
        }

        for (var i = 0; i < sourceData.length; i++) {
            var service = sourceData[i];
            var score = 0;
            var title = normalizePetText(service.title);
            var category = normalizePetText(service.category);
            var haystack = normalizePetText([
                service.summary,
                service.location,
                service.time,
                service.materials.join(" "),
                service.steps.join(" "),
                service.notes.join(" ")
            ].join(" "));

            if (title.indexOf(query) !== -1 || query.indexOf(title) !== -1) score += 32;
            if (category.indexOf(query) !== -1 || query.indexOf(category) !== -1) score += 6;
            if (haystack.indexOf(query) !== -1) score += 10;

            for (var j = 0; j < service.keywords.length; j++) {
                var keyword = normalizePetText(service.keywords[j]);
                if (!keyword) continue;
                if (query.indexOf(keyword) !== -1 || keyword.indexOf(query) !== -1) {
                    score += keyword.length > 2 ? 14 : 8;
                }
            }

            if (score > 0) {
                results.push({ service: service, score: score });
            }
        }

        results.sort(function (a, b) { return b.score - a.score; });
        return results;
    }

    function addPetMessage(target, type, text, matches, isThinking) {
        var message = document.createElement("div");
        message.className = "pet-message pet-message-" + type + (isThinking ? " pet-message-thinking" : "");
        if (type === "bot") {
            var avatar = document.createElement("img");
            avatar.className = "pet-message-avatar";
            avatar.src = "images/vercel-assets/asset-011.png";
            avatar.alt = "小橘学长头像";
            message.appendChild(avatar);
        }
        var body = document.createElement("div");
        body.className = "pet-message-body";
        message.appendChild(body);
        renderPetMessageContent(message, text);

        if (matches && matches.length) {
            var actions = document.createElement("div");
            actions.className = "pet-result-actions";
            for (var j = 0; j < matches.length; j++) {
                var button = document.createElement("button");
                button.type = "button";
                button.setAttribute("data-pet-service", matches[j].title);
                button.textContent = "查看：" + matches[j].title;
                actions.appendChild(button);
            }
            body.appendChild(actions);
        }

        target.appendChild(message);
        target.scrollTop = target.scrollHeight;
        return message;
    }

    function updatePetMessage(target, message, text) {
        if (!message) return;
        renderPetMessageContent(message, text);
        target.scrollTop = target.scrollHeight;
    }

    function renderPetMessageContent(message, text) {
        var contentTarget = message.querySelector(".pet-message-body") || message;
        contentTarget.textContent = "";
        var lines = String(text || "").split(/\r?\n/);
        var currentList = null;
        var currentListType = "";

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            var bullet = line.match(/^\s*[-*+]\s+(.+)$/);
            var numbered = line.match(/^\s*\d+[.、]\s+(.+)$/);

            if (bullet || numbered) {
                var listType = numbered ? "ol" : "ul";
                if (!currentList || currentListType !== listType) {
                    currentList = document.createElement(listType);
                    currentListType = listType;
                    contentTarget.appendChild(currentList);
                }
                var item = document.createElement("li");
                appendInlineMarkdown(item, bullet ? bullet[1] : numbered[1]);
                currentList.appendChild(item);
                continue;
            }

            currentList = null;
            currentListType = "";
            var paragraph = document.createElement("p");
            appendInlineMarkdown(paragraph, line);
            contentTarget.appendChild(paragraph);
        }
    }

    function appendInlineMarkdown(target, text) {
        var source = String(text || "");
        var pattern = /(\*\*|__)(.+?)\1/g;
        var lastIndex = 0;
        var match;
        while ((match = pattern.exec(source)) !== null) {
            if (match.index > lastIndex) {
                target.appendChild(document.createTextNode(source.slice(lastIndex, match.index)));
            }
            var strong = document.createElement("strong");
            strong.textContent = match[2];
            target.appendChild(strong);
            lastIndex = pattern.lastIndex;
        }
        if (lastIndex < source.length) {
            target.appendChild(document.createTextNode(source.slice(lastIndex)));
        }
    }

    function readPetChatStream(response, onEvent) {
        var reader = response.body.getReader();
        var decoder = new TextDecoder();
        var buffer = "";

        function readNext() {
            return reader.read().then(function (chunk) {
                if (chunk.done) {
                    buffer += decoder.decode();
                    flushPetStreamBuffer(buffer, onEvent);
                    return;
                }
                buffer += decoder.decode(chunk.value, { stream: true });
                var blocks = buffer.split(/\n\n+/);
                buffer = blocks.pop() || "";
                flushPetStreamBuffer(blocks.join("\n\n"), onEvent);
                return readNext();
            });
        }

        return readNext();
    }

    function flushPetStreamBuffer(text, onEvent) {
        var blocks = String(text || "").split(/\n\n+/);
        for (var i = 0; i < blocks.length; i++) {
            var block = blocks[i];
            if (!block) continue;
            var eventName = "message";
            var dataText = "";
            var lines = block.split(/\r?\n/);
            for (var j = 0; j < lines.length; j++) {
                if (lines[j].indexOf("event:") === 0) {
                    eventName = lines[j].slice(6).trim();
                } else if (lines[j].indexOf("data:") === 0) {
                    dataText += lines[j].slice(5).trim();
                }
            }
            if (!dataText) continue;
            onEvent(eventName, JSON.parse(dataText));
        }
    }
    function removePetMessage(target, message) {
        if (message && message.parentNode === target) {
            target.removeChild(message);
        }
    }

    function openPetService(title) {
        if (!title) {
            return;
        }

        if (typeof window.campusOpenServiceByTitle === "function") {
            window.campusOpenServiceByTitle(title);
            return;
        }

        sessionStorage.setItem("campusPetTargetService", title);
        window.location.href = "service.html";
    }

    function bindPetDrag(assistant, petButton) {
        var dragState = null;
        petButton.addEventListener("pointerdown", function (event) {
            if (event.button !== 0) return;
            var rect = assistant.getBoundingClientRect();
            dragState = {
                startX: event.clientX,
                startY: event.clientY,
                left: rect.left,
                top: rect.top,
                moved: false
            };
            assistant.classList.add("is-dragging");
            petButton.setPointerCapture(event.pointerId);
        });

        petButton.addEventListener("pointermove", function (event) {
            if (!dragState) return;
            var dx = event.clientX - dragState.startX;
            var dy = event.clientY - dragState.startY;
            if (Math.abs(dx) > 4 || Math.abs(dy) > 4) dragState.moved = true;
            assistant.style.left = clamp(dragState.left + dx, 12, window.innerWidth - 104) + "px";
            assistant.style.top = clamp(dragState.top + dy, 12, window.innerHeight - 104) + "px";
            assistant.style.right = "auto";
            assistant.style.bottom = "auto";
            positionChatPanel(assistant);
        });

        petButton.addEventListener("pointerup", function (event) {
            if (!dragState) return;
            assistant.classList.remove("is-dragging");
            petButton.releasePointerCapture(event.pointerId);
            savePetPosition(assistant);
            if (dragState.moved) {
                event.preventDefault();
                event.stopPropagation();
            }
            dragState = null;
        });
    }

    function restorePetPosition(assistant) {
        try {
            var saved = JSON.parse(localStorage.getItem("campusPetPosition") || "null");
            if (saved && typeof saved.left === "number" && typeof saved.top === "number") {
                assistant.style.left = clamp(saved.left, 12, window.innerWidth - 104) + "px";
                assistant.style.top = clamp(saved.top, 12, window.innerHeight - 104) + "px";
                assistant.style.right = "auto";
                assistant.style.bottom = "auto";
            }
        } catch (error) {
            localStorage.removeItem("campusPetPosition");
        }
    }

    function savePetPosition(assistant) {
        var rect = assistant.getBoundingClientRect();
        localStorage.setItem("campusPetPosition", JSON.stringify({ left: rect.left, top: rect.top }));
    }

    function keepPetInViewport(assistant) {
        var rect = assistant.getBoundingClientRect();
        if (rect.left || rect.top) {
            assistant.style.left = clamp(rect.left, 12, window.innerWidth - 104) + "px";
            assistant.style.top = clamp(rect.top, 12, window.innerHeight - 104) + "px";
        }
    }

    function positionChatPanel(assistant) {
        var rect = assistant.getBoundingClientRect();
        assistant.classList.toggle("chat-left", rect.left > window.innerWidth * 0.55);
        assistant.classList.toggle("chat-below", rect.top < 160);
    }

    function normalizePetText(value) {
        return String(value || "").toLowerCase().replace(/[^一-龥a-z0-9]+/g, "");
    }

    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

})();
