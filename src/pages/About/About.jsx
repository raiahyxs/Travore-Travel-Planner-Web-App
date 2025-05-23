import React from 'react';
import DayBackground from '../../components/DayBackground';
import NightBackground from '../../components/NightBackground';
import { useDarkMode } from "../../ColorThemeContext";

function About() {
    const { darkMode } = useDarkMode();

    const teamMembers = [
        { name: "Alanis Danica Concha", link: "https://myportfolio-blond-two-43.vercel.app/" },
        { name: "Althea Bianca Falnican", link: "https://portfolio-phi-murex-44.vercel.app/" },
        { name: "Chelo Macatangay", link: "https://portfolio-website-chelomacatangays-projects.vercel.app/" },
        { name: "Christian Joseph Ostaga", link: "https://portfolionicj.netlify.app/" },
        { name: "Dwight Francis Caña", link: "https://vercel.com/sso/access/request?next=%2Fsso-api%3Furl%3Dhttps%253A%252F%252Fwawawawa-mccpvv6z5-joshwaa-ymcas-projects.vercel.app%252F%26nonce%3D94251e7289b6e0752ec44d93ed6c5b190e83917553999bd5268145196641c62b&url=wawawawa-mccpvv6z5-joshwaa-ymcas-projects.vercel.app" },
        { name: "Jaynard Diosay", link: "https://jay-21-hub.github.io/Portfolio/?fbclid=IwY2xjawKcYABleHRuA2FlbQIxMABicmlkETFGUk5Pa3FlSUNRcWpnWjM1AR7jJVp9WzmTF6-4_KQgjgNlMH4XyV23QOA8kt9fw3yeyecQlcUSA36LN00OtA_aem_ikwsPzDXKdCSmU9HxuoRSA" },
        { name: "Joshua Sumaginsing", link: "https://vercel.com/sso/access/request?next=%2Fsso-api%3Furl%3Dhttps%253A%252F%252Fwawawawa-mccpvv6z5-joshwaa-ymcas-projects.vercel.app%252F%26nonce%3D94251e7289b6e0752ec44d93ed6c5b190e83917553999bd5268145196641c62b&url=wawawawa-mccpvv6z5-joshwaa-ymcas-projects.vercel.app" },
        { name: "Jon Stephen Navallo", link: "https://vercel.com/sso/access/request?next=%2Fsso-api%3Furl%3Dhttps%253A%252F%252Fwawawawa-mccpvv6z5-joshwaa-ymcas-projects.vercel.app%252F%26nonce%3D94251e7289b6e0752ec44d93ed6c5b190e83917553999bd5268145196641c62b&url=wawawawa-mccpvv6z5-joshwaa-ymcas-projects.vercel.app" },
        { name: "Lemuel De Ramos", link: "https://react-portfolio-ko.vercel.app/?fbclid=IwY2xjawKcX7JleHRuA2FlbQIxMABicmlkETFGUk5Pa3FlSUNRcWpnWjM1AR762aip7uohtkTYjZrSqSLe_vIosIVvJjWo5VK2utsJpqTjRPkOlGT_JGuFoA_aem_y4kvB6eOUUtXS2lvtX6CJQ" },
        { name: "Rhealyn Vasquez (Leader)", link: "https://raiahyxs.github.io/react-router/?fbclid=IwY2xjawKcX8lleHRuA2FlbQIxMABicmlkETFGUk5Pa3FlSUNRcWpnWjM1AR6gezI6FEh_F2iNvGqjWWd5D_8tJLnJ7yiqgbA5F7vYLVgbaJl396Fj3_wPVg_aem_CFYcO5zBgdZlmxHT8ilblg" },
        { name: "Robert Josh Deiparine", link: "https://react-portfolio-1-ten.vercel.app/?fbclid=IwY2xjawKcX49leHRuA2FlbQIxMABicmlkETFGUk5Pa3FlSUNRcWpnWjM1AR6XNH-j-GXI4wwF9dnkaGjab9tVVrRzeKCwiV2bqW5KsIqrzaWcNCfViVH_4g_aem_kivh5ImBvT2BGZOYAsPB6Q" },
        { name: "Zairesh Marie Castillo", link: "https://zairesh-portfolio.netlify.app/" }
    ];

    React.useEffect(() => {
        if (darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
        return () => {
            document.body.classList.remove('dark-mode');
        };
    }, [darkMode]);

    return (
        <div className="w-full min-h-screen flex flex-col">
            <div className="relative md:pl-[6rem] w-full min-h-screen h-auto flex flex-col flex-grow">
                <div className="absolute inset-0 z-0">
                    {darkMode ? <NightBackground /> : <DayBackground />}
                </div>
                <main className="relative z-10 max-w-7xl mx-auto py-6 px-2 md:py-8 md:px-2 flex flex-col flex-grow w-full">
                    <section className="flex flex-col md:flex-row md:items-start gap-1 md:gap-2 border border-white/25 rounded-xl p-6 md:p-8 bg-[#E2EDEF]/15 dark:bg-slate-900/20 backdrop-blur mt-[-2vw] sticky top-5">
                        <div className="order-1 flex flex-col gap-3 md:gap-2 md:w-3/5 lg:w-3/5 xl:w-2/3">
                            <header className="mb-0 flex flex-col items-center md:items-start">
                                <h1 className="text-2xl md:text-[2.25rem] xl:text-5xl font-bold text-primary-Text-LightMode dark:text-primary-Text-DarkMode text-center md:text-left">
                                    About our Project
                                </h1>
                            </header>
                            <div className="flex flex-col gap-8">
                                <section className="bg-primary-Bg-LightMode text-primary-Text-LightMode dark:bg-primary-Bg-DarkMode2 dark:text-primary-Text-DarkMode p-6 rounded-xl shadow-xl backdrop-blur-lg">
                                    <p className="text-base md:text-base-lg leading-relaxed">
                                        Travore was created to make travel planning simpler, more intuitive, and more enjoyable. Built with the traveler in mind, it offers a streamlined experience that removes the hassle often associated with organizing trips. Whether you're preparing for a short getaway or a longer journey, Travore ensures you have everything you need to plan with ease.
                                    </p>
                                </section>
                                <section className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                    <div className="bg-primary-Bg-LightMode text-primary-Text-LightMode dark:text-primary-Text-DarkMode dark:bg-primary-Bg-DarkMode2 p-6 rounded-xl shadow-xl backdrop-blur-lg">
                                        <h2 className="text-2xl font-bold mb-3 text-primary-Text-LightMode dark:text-primary-Text-DarkMode">Goal</h2>
                                        <p className="text-base md:text-[1rem] leading-relaxed">
                                            At Travore, we help travelers plan confidently with a user-friendly map, real-time weather, and a scheduling calendar. With location enabled, Travore also recommends nearby destinations, making it easy to discover new places.
                                        </p>
                                    </div>
                                    <div className="bg-primary-Bg-LightMode text-primary-Text-LightMode dark:text-primary-Text-DarkMode dark:bg-primary-Bg-DarkMode2 p-6 rounded-xl shadow-xl backdrop-blur-lg">
                                        <h2 className="text-2xl font-bold mb-3 text-primary-Text-LightMode dark:text-primary-Text-DarkMode">Mission</h2>
                                        <p className="text-base md:[1rem] leading-relaxed">
                                            Our mission is to make travel planning safe, enjoyable, and inspiring, helping travelers focus on creating unforgettable memories.
                                        </p>
                                    </div>
                                </section>
                            </div>
                        </div>
                        <aside className="order-2 flex flex-col items-center gap-6 md:gap-8 md:w-[35%] lg:w-[35%] xl:w-1/3 lg:relative lg:top-5 lg:self-start">
                            <div className="w-full flex justify-center">
                                <a 
                                    href="https://l.facebook.com/l.php?u=https%3A%2F%2Fgithub.com%2Fraiahyxs%2FITPS205_PROJECT%3Ffbclid%3DIwZXh0bgNhZW0CMTAAYnJpZBExd1B1Rm00ZHl2WFhnNFdHYQEeJOxy0JMCyNM84vDR-FURfCnDeG8q4g4lq_kNXPh41GZUHQCAdXoXTVS8ktE_aem_gD9Ehko14yaDfnp9BsNIug&h=AT2bQD7OPKuqeyS8QGfOrkF5s1-BbnTw2ilWLY3b0Hm0tDVIlrQq4hSlAvhDw4K8P49Hre7BEo0YnNfO6aYkCs9iCe8U6Ivfgrtf5MlcYNdXgrjVP3HrYMfMhTIevjFq1intYA" 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="inline-flex items-center justify-center gap-2.5 bg-gray-200/90 dark:bg-primary-Bg-LightMode hover:bg-white dark:hover:bg-primary-Button-DarkMode_Hover text-gray-800 dark:text-primary-Text-DarkMode1 py-2.5 px-3 text-sm font-semibold rounded-md shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 ease-in-out min-w-[220px]"
                                >
                                    <i className="fab fa-github text-xl"></i>
                                    Check the Github
                                </a>
                            </div>
                            <section className="w-4/5 bg-primary-Bg-LightMode dark:bg-primary-Bg-DarkMode2 text-primary-Text-LightMode dark:text-primary-Text-DarkMode p-6 rounded-xl shadow-xl backdrop-blur-lg">
                                <h2 className="text-2xl font-bold mb-3 text-center md:text-left text-primary-Text-LightMode dark:text-primary-Text-DarkMode">Team Members:</h2>
                                <ul className="list-none p-0 text-center">
                                    {teamMembers.map((member, index) => (
                                        <li key={index} className="text-sm md:text-base py-1">
                                            <a 
                                                href={member.link} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="hover:underline hover:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                                            >
                                                {member.name}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        </aside>
                    </section>
                </main>
            </div>
        </div>
    );
}

export default About;
