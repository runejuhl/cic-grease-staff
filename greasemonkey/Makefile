VERSION := $(shell grep -E --color=never 'version[ ]+' CIC_employee/CIC_employee.user.js | grep -Eo --color=never '[0-9]\.[0-9]+$$')
NAME := CIC_employee.final.${VERSION}.user.js

all: js clean upload

js:
	echo ${VERSION}
	echo ${NAME}
	sed -r 's/^(.*)$$/\1 \\n\\/g' style.css > style.js
	cp CIC_employee/CIC_employee.user.js $(NAME)
	sed -i -e '/CSSSENTINEL/{r style.js' -e 'd}' $(NAME)

clean:
	rm style.js

upload:
	rsync -Pa $(NAME) creep:public_html/CIC_employee/
