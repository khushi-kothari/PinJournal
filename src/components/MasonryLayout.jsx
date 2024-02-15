import React from 'react';
import Masonry from 'react-masonry-css';
import Pin from './Pin';

const breakpointColumnsObj = {
  default: 4,
  3000: 5,
  2000: 4,
  1200: 3,
  1000: 2,
  500: 1,
};

const MasonryLayout = ({ pins }) => (
  <Masonry className="flex animate-slide-fwd gap-1" breakpointCols={breakpointColumnsObj}>
    {pins?.map((pin, i) => <Pin key={i} pin={pin} className="w-max" />)}
  </Masonry>
);

export default MasonryLayout;