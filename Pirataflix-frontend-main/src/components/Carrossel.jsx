import { Carousel } from "react-bootstrap";
import "./Carrossel.css";

import img1 from "../Images/img1.png";
import img2 from "../Images/img2.png";
import img3 from "../Images/img3.png";
import img4 from "../Images/img4.png";

const Carrossel = () => {
    return (
        <div className="carousel-wrapper mb-5">
            <Carousel fade interval={4000} pause="hover" indicators={false}>
                <Carousel.Item>
                    <img
                        className="d-block w-100 carousel-img"
                        src={img1}
                        alt="O Poderoso Chefão"
                    />
                    <Carousel.Caption>
                        <h1>O Poderoso Chefão</h1>
                        <p>1972 - 2h 55min</p>
                    </Carousel.Caption>
                </Carousel.Item>

                <Carousel.Item>
                    <img
                        className="d-block w-100 carousel-img"
                        src={img2}
                        alt="Interestelar"
                    />
                    <Carousel.Caption>
                        <h1>Interestelar</h1>
                        <p>2014 - 2h 59min</p>
                    </Carousel.Caption>
                </Carousel.Item>

                <Carousel.Item>
                    <img
                        className="d-block w-100 carousel-img"
                        src={img3}
                        alt="Batman:  O Cavaleiro das Trevas"
                    />
                    <Carousel.Caption>
                        <h1>Batman: O Cavaleiro das Trevas</h1>
                        <p>2008 - 2h 32min</p>
                    </Carousel.Caption>
                </Carousel.Item>

                <Carousel.Item>
                    <img
                        className="d-block w-100 carousel-img"
                        src={img4}
                        alt="Matrix"
                    />
                    <Carousel.Caption>
                        <h1>Matrix</h1>
                        <p>1999 - 2h 16min</p>
                    </Carousel.Caption>
                </Carousel.Item>
            </Carousel>
        </div>
    );
};

export default Carrossel;