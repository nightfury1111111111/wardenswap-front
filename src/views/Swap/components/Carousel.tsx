/* eslint-disable object-shorthand */
/* eslint-disable prefer-template */
/* eslint-disable import/no-unresolved */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable react/jsx-no-duplicate-props */
import React from 'react';
import _ from 'lodash'
import { Carousel as CarouselComponent } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";
// import { AnimationHandler, AnimationHandlerResponse } from 'react-responsive-carousel/lib/ts/components/Carousel/types';

// const fadeAnimationHandler: AnimationHandler = (props, state): AnimationHandlerResponse => {
//     const transitionTime = props.transitionTime + 'ms';
//     const transitionTimingFunction = 'ease-in-out';

//     let slideStyle: React.CSSProperties = {
//         position: 'absolute',
//         display: 'block',
//         zIndex: -2,
//         minHeight: '100%',
//         opacity: 0,
//         top: 0,
//         right: 0,
//         left: 0,
//         bottom: 0,
//         transitionTimingFunction: transitionTimingFunction,
//         msTransitionTimingFunction: transitionTimingFunction,
//         MozTransitionTimingFunction: transitionTimingFunction,
//         WebkitTransitionTimingFunction: transitionTimingFunction,
//         OTransitionTimingFunction: transitionTimingFunction,
//     };

//     if (!state.swiping) {
//         slideStyle = {
//             ...slideStyle,
//             WebkitTransitionDuration: transitionTime,
//             MozTransitionDuration: transitionTime,
//             OTransitionDuration: transitionTime,
//             transitionDuration: transitionTime,
//             msTransitionDuration: transitionTime,
//         };
//     }

//     return {
//         slideStyle,
//         selectedStyle: { ...slideStyle, opacity: 1, position: 'relative' },
//         prevStyle: { ...slideStyle },
//     };
// };

const Carousel: React.FC = () => {
    const url = "/images/img/carousel/"
    const bgs = [url+"bg1.svg",url+"bg2.svg",url+"bg3.svg",url+"bg4.svg",url+"bg5.svg",url+"bg6.svg",]
    const renderCarouselBg = () => {
        return  <CarouselComponent infiniteLoop useKeyboardArrows autoPlay > 
        {_.map(bgs, i=> {
            return <div role="tabpanel" className="VueCarousel-slide" aria-hidden="true">
            <div >
                <img src={i} className="img-style v-lazy-image v-lazy-image-loaded" />
            </div>
        </div>
        })}
        </CarouselComponent>
    }

    return (
        <div id="BannerCarousel">
            {renderCarouselBg()}
        </div>

    )

}

export default Carousel
