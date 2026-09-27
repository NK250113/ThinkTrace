"use client";

const bulletImages = [
  {
    id: 'star',
    src: '/images/star.png',
  },
  {
    id: 'circle',
    src: '/images/circle.png',
  },
  {
    id: 'leaf',
    src: '/images/leaf.png',
  },
  {
    id: 'diamond',
    src: '/images/diamond.png',
  },
]

import { ListItem } from '@tiptap/extension-list';
export const CustomListItem = ListItem.extend({
  addAttributes() {
    return {
      bulletImage: {
        default: '/star.png',

        renderHTML: attributes => {
          return {
            'data-bullet-image': attributes.bulletImage,
            style: `--bullet-image: url("${attributes.bulletImage}")`,
          }
        },

        parseHTML: element => {
          return element.getAttribute('data-bullet-image')
        },
      },
    }
  },
})