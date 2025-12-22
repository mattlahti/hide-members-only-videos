const TAB_STATISTICS = 'stats-tab';
const TAB_SETTINGS = 'settings-tab';
const TAB_ABOUT = 'about-tab';
const TAB_BUTTONS = {
    [TAB_STATISTICS]: document.getElementById('stats-tab'),
    [TAB_SETTINGS]: document.getElementById('settings-tab'),
    [TAB_ABOUT]: document.getElementById('about-tab'),
};
const TAB_SECTIONS = {
    [TAB_STATISTICS]: document.getElementById('stats-section'),
    [TAB_SETTINGS]: document.getElementById('settings-section'),
    [TAB_ABOUT]: document.getElementById('about-section'),
};

let activeTab = TAB_STATISTICS;

const updateTabDom = () => {
    Object.values(TAB_BUTTONS).forEach(button => button.classList.remove('tab-active'));
    Object.values(TAB_SECTIONS).forEach(section => section.style.display = 'none');
    TAB_BUTTONS[activeTab].classList.add('tab-active');
    TAB_SECTIONS[activeTab].style.display = 'block';
};

const onTabClick = e => {
    activeTab = e.target.id;
    updateTabDom();
};

Object.values(TAB_BUTTONS).forEach(tabButton => tabButton.addEventListener('click', onTabClick));
updateTabDom();
