const hueOffset = 150;
			const hueRange = 150;
			const saturation = 100;
			const lightness = 70;
			const initialRotation = 45;
			const rotationScale = 180;
			
			let container;
			
			let scrollHeight = 0;
			let scrollRaf = 0;
			
			const handleResize = () => {
			  const body = document.body;
			  const html = document.documentElement;
			  
			  scrollHeight = Math.max(
				body.scrollHeight,
				body.offsetHeight,
				html.clientHeight,
				html.scrollHeight,
				html.offsetHeight
			  ) - window.innerHeight;
			}
			
			const handleScroll = () => {
			  const ratio = window.scrollY / scrollHeight;
			  
			  const currentHue = ((hueRange * ratio) + hueOffset) % 360;
			  
			  const colorOne = `hsl(${currentHue}, ${saturation}%, ${lightness}%)`;
			  const colorTwo = `hsl(${360 - currentHue}, ${saturation}%, ${lightness}%)`;
			  const rotation = initialRotation + (rotationScale * ratio);
			  
			  container.style.background =
				`linear-gradient(${rotation}deg, ${colorOne}, ${colorTwo})`;
			}
			
			const handleScrollRaf = () => {
			  cancelAnimationFrame(scrollRaf);
			  scrollRaf = requestAnimationFrame(handleScroll);
			}
			
			const init = () => {
			  container = document.querySelector('.container');
			  
			  window.addEventListener('scroll', handleScrollRaf);
			  window.addEventListener('resize', handleResize);
			  
			  handleResize();
			  handleScroll();
			}
			
			window.addEventListener('load', init);