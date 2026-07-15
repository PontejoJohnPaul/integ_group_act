* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Poppins', sans-serif;
    scroll-behavior: smooth;
}

body {
    background: #f5f7fb;
    color: #333;
    line-height: 1.6;
}



header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    padding: 18px 8%;
    background: #fff;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 3px 15px rgba(0,0,0,.08);
    z-index: 1000;
}

.logo {
    font-size: 24px;
    font-weight: 700;
    color: #2563eb;
}

nav {
    display: flex;
    gap: 30px;
}

nav a {
    text-decoration: none;
    color: #444;
    font-weight: 500;
    transition: .3s;
}

nav a:hover {
    color: #2563eb;
}



.hero {
    padding: 140px 8% 90px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 50px;
    flex-wrap: wrap;
}

.hero-text {
    flex: 1;
    min-width: 320px;
}

.hero-text h1 {
    font-size: 55px;
    line-height: 1.2;
    margin-bottom: 20px;
}

.hero-text span {
    color: #2563eb;
}

.hero-text p {
    font-size: 18px;
    color: #666;
    margin-bottom: 30px;
    max-width: 600px;
}

.btn {
    display: inline-block;
    padding: 15px 35px;
    background: #2563eb;
    color: white;
    border-radius: 40px;
    text-decoration: none;
    font-weight: 600;
    transition: .3s;
}

.btn:hover {
    background: #1d4ed8;
    transform: translateY(-3px);
}

.hero-card {
    width: 360px;
    background: white;
    padding: 35px;
    border-radius: 20px;
    box-shadow: 0 15px 35px rgba(0,0,0,.08);
}

.hero-card h2 {
    margin-bottom: 20px;
}

.rate {
    display: flex;
    justify-content: space-between;
    padding: 15px 0;
    border-bottom: 1px solid #eee;
    font-size: 18px;
}

.live {
    margin-top: 20px;
    text-align: center;
    color: #2563eb;
    font-weight: 600;
}



.stats {
    background: white;
    padding: 70px 8%;
    display: flex;
    justify-content: space-around;
    flex-wrap: wrap;
    text-align: center;
}

.stat {
    margin: 20px;
}

.stat h2 {
    font-size: 45px;
    color: #2563eb;
    margin-bottom: 10px;
}



.title {
    text-align: center;
    font-size: 38px;
    margin-bottom: 60px;
}



.currencies {
    padding: 90px 8%;
    background: white;
}

.currency-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit,minmax(180px,1fr));
    gap: 25px;
}

.currency {
    background: #2563eb;
    color: white;
    padding: 25px;
    border-radius: 15px;
    text-align: center;
    font-weight: 600;
    cursor: pointer;
    transition: .3s;
}

.currency:hover {
    transform: translateY(-5px);
    background: #1d4ed8;
}



.about {
    padding: 90px 8%;
    text-align: center;
}

.about p {
    max-width: 800px;
    margin: auto;
    color: #666;
    line-height: 1.8;
}



footer {
    background: #0f172a;
    color: white;
    text-align: center;
    padding: 45px 20px;
    margin-top: 60px;
}

footer h3 {
    margin-bottom: 10px;
}


@media (max-width:900px){

    header{
        flex-direction:column;
        gap:15px;
    }

    nav{
        gap:15px;
        flex-wrap:wrap;
        justify-content:center;
    }

    .hero{
        flex-direction:column;
        text-align:center;
    }

    .hero-card{
        width:100%;
        max-width:420px;
    }

    .hero-text h1{
        font-size:40px;
    }

    .title{
        font-size:30px;
    }

}

@media (max-width:600px){

    .hero-text h1{
        font-size:32px;
    }

    .hero-text p{
        font-size:16px;
    }

    .stat h2{
        font-size:36px;
    }

    .currency-grid{
        grid-template-columns:1fr;
    }

}
