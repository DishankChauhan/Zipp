import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			primary: {
  				'50': '#f8f9fa',
  				'100': '#f1f3f4',
  				'200': '#e8eaed',
  				'300': '#dadce0',
  				'400': '#bdc1c6',
  				'500': '#9aa0a6',
  				'600': '#80868b',
  				'700': '#5f6368',
  				'800': '#3c4043',
  				'900': '#202124',
  				'950': '#0d0e0f',
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			accent: {
  				'50': '#ffffff',
  				'100': '#fafafa',
  				'200': '#f5f5f5',
  				'300': '#e5e5e5',
  				'400': '#d4d4d4',
  				'500': '#a3a3a3',
  				'600': '#737373',
  				'700': '#525252',
  				'800': '#404040',
  				'900': '#262626',
  				'950': '#171717',
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			background: 'hsl(var(--background))',
  			border: 'hsl(var(--border))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		animation: {
  			'fade-in': 'fadeIn 0.5s ease-in-out',
  			'fade-in-up': 'fadeInUp 0.6s ease-out',
  			'fade-in-down': 'fadeInDown 0.6s ease-out',
  			'slide-in-left': 'slideInLeft 0.5s ease-out',
  			'slide-in-right': 'slideInRight 0.5s ease-out',
  			'scale-in': 'scaleIn 0.3s ease-out',
  			'bounce-subtle': 'bounceSubtle 0.6s ease-out',
  			glow: 'glow 2s ease-in-out infinite alternate',
  			shimmer: 'shimmer 2s linear infinite',
  			float: 'float 3s ease-in-out infinite',
  			marquee: 'marquee var(--duration) linear infinite',
  			'star-movement-bottom': 'star-movement-bottom linear infinite alternate',
  			'star-movement-top': 'star-movement-top linear infinite alternate',
  			'marquee-scroll': 'marquee-scroll var(--duration, 30s) linear infinite'
  		},
  		keyframes: {
  			fadeIn: {
  				'0%': {
  					opacity: '0'
  				},
  				'100%': {
  					opacity: '1'
  				}
  			},
  			fadeInUp: {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(20px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			fadeInDown: {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(-20px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			slideInLeft: {
  				'0%': {
  					opacity: '0',
  					transform: 'translateX(-20px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateX(0)'
  				}
  			},
  			slideInRight: {
  				'0%': {
  					opacity: '0',
  					transform: 'translateX(20px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateX(0)'
  				}
  			},
  			scaleIn: {
  				'0%': {
  					opacity: '0',
  					transform: 'scale(0.9)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'scale(1)'
  				}
  			},
  			bounceSubtle: {
  				'0%, 20%, 53%, 80%, 100%': {
  					transform: 'translate3d(0,0,0)'
  				},
  				'40%, 43%': {
  					transform: 'translate3d(0, -8px, 0)'
  				},
  				'70%': {
  					transform: 'translate3d(0, -4px, 0)'
  				},
  				'90%': {
  					transform: 'translate3d(0, -2px, 0)'
  				}
  			},
  			glow: {
  				'0%': {
  					boxShadow: '0 0 5px rgba(255, 255, 255, 0.2)'
  				},
  				'100%': {
  					boxShadow: '0 0 20px rgba(255, 255, 255, 0.4)'
  				}
  			},
  			shimmer: {
  				'0%': {
  					transform: 'translateX(-100%)'
  				},
  				'100%': {
  					transform: 'translateX(100%)'
  				}
  			},
  			float: {
  				'0%, 100%': {
  					transform: 'translateY(0px)'
  				},
  				'50%': {
  					transform: 'translateY(-10px)'
  				}
  			},
  			marquee: {
  				from: { transform: 'translateX(0)' },
  				to: { transform: 'translateX(calc(-100% - var(--gap)))' }
  			},
  			'star-movement-bottom': {
  				'0%': { transform: 'translate(0%, 0%)', opacity: '1' },
  				'100%': { transform: 'translate(-100%, 0%)', opacity: '0' }
  			},
  			'star-movement-top': {
  				'0%': { transform: 'translate(0%, 0%)', opacity: '1' },
  				'100%': { transform: 'translate(100%, 0%)', opacity: '0' }
  			},
  			'marquee-scroll': {
  				to: { transform: 'translateX(-50%)' }
  			}
  		},
  		backdropBlur: {
  			xs: '2px'
  		},
  		borderWidth: {
  			'0.5': '0.5px'
  		},
  		boxShadow: {
  			glow: '0 0 20px rgba(255, 255, 255, 0.1)',
  			'glow-lg': '0 0 40px rgba(255, 255, 255, 0.15)',
  			'inner-glow': 'inset 0 0 20px rgba(255, 255, 255, 0.05)'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};

export default config; 